"""
MkDocs hook: a separate search index per language, so a search on a Dutch page only finds Dutch pages, and words
with a hyphen can also be found without it ("wifi" finds "Wi-Fi").

The i18n plugin builds the languages one after the other and puts the pages of all of them in one search index,
site/search/search_index.json. After that, this hook splits that index up: the default language (English, at the
root of the site) keeps search/search_index.json with only its own pages, and every other language gets its own
<language>/search/search_index.json. The pages of a language load the index in their own folder, because
overrides/main.html points their search there.

The search splits words on hyphens, so "Wi-Fi" is only found as "wi" and "fi", not as "wifi". So every page also
gets its hyphenated words written together ("wifi", "email", "usbc") in two extra fields, title_variants and
text_variants. The search looks in those fields too, but doesn't show them in the results.
"""
import json
import os
import re

from mkdocs.plugins import event_priority

HTML_TAG = re.compile(r"<[^>]+>")
HYPHENATED_WORD = re.compile(r"\w+(?:-\w+)+")


def joined_variants(html):
    """The hyphenated words in a title or text, written without the hyphens: "Wi-Fi and e-mail" -> "email wifi"."""
    words = HYPHENATED_WORD.findall(HTML_TAG.sub(" ", html or ""))
    return " ".join(sorted({word.replace("-", "").lower() for word in words}))


def with_variants(doc):
    doc = dict(doc)
    for field in ("title", "text"):
        variants = joined_variants(doc.get(field))
        if variants:
            doc[field + "_variants"] = variants
    return doc


@event_priority(-200)  # after the i18n plugin (-100), which writes the combined index in its on_post_build
def on_post_build(config):
    i18n = config.plugins.get("i18n")
    if i18n is None or i18n.building:
        return  # one of the i18n plugin's builds of a single language; the combined index isn't there yet

    combined_path = os.path.join(config.site_dir, "search", "search_index.json")
    if not os.path.exists(combined_path):
        return

    with open(combined_path, encoding="utf-8") as file:
        combined = json.load(file)

    # Search the variants as much as the field they come from, so a match in a title still ranks first
    fields = dict(combined["config"].get("fields", {}))
    for field in ("title", "text"):
        if field in fields:
            fields[field + "_variants"] = fields[field]

    default = i18n.default_language
    folders = [language for language in i18n.build_languages if language != default]

    def language_of(location):
        # The pages of the other languages are in a folder named after the language, e.g. "nl/UsingYourBox/..."
        folder = location.split("/", 1)[0]
        return folder if folder in folders else default

    for language in i18n.build_languages:
        prefix = "" if language == default else language + "/"
        docs = [
            # Locations relative to the language's folder, which is where its pages look them up
            with_variants(dict(doc, location=doc["location"][len(prefix):]))
            for doc in combined["docs"]
            if language_of(doc["location"]) == language
        ]
        index = dict(combined, docs=docs, config=dict(combined["config"], lang=[language], fields=fields))

        path = os.path.join(config.site_dir, prefix, "search", "search_index.json")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as file:
            json.dump(index, file, ensure_ascii=False, separators=(",", ":"))
