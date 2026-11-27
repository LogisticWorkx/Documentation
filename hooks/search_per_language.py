"""
MkDocs hook: a separate search index per language, so a search on a Dutch page only finds Dutch pages. It also
makes the search more forgiving: words with a hyphen are found without it ("wifi" finds "Wi-Fi"), and pages are
found with the synonyms in search-synonyms.yml ("play area" or "edge" finds the guardian pages).

The i18n plugin builds the languages one after the other and puts the pages of all of them in one search index,
site/search/search_index.json. After that, this hook splits that index up: the default language (English, at the
root of the site) keeps search/search_index.json with only its own pages, and every other language gets its own
<language>/search/search_index.json. The pages of a language load the index in their own folder, because
overrides/main.html points their search there.

The extra words go in fields of their own (title_variants, text_variants and synonyms). The search looks in those
fields too, but doesn't show them in the results.
"""
import json
import os
import re

import yaml
from mkdocs.plugins import event_priority

HTML_TAG = re.compile(r"<[^>]+>")
HYPHENATED_WORD = re.compile(r"\w+(?:-\w+)+")
SYNONYMS_FILE = "search-synonyms.yml"


def plain_text(html):
    return HTML_TAG.sub(" ", html or "")


def joined_variants(html):
    """The hyphenated words in a title or text, written without the hyphens: "Wi-Fi and e-mail" -> "email wifi"."""
    words = HYPHENATED_WORD.findall(plain_text(html))
    return " ".join(sorted({word.replace("-", "").lower() for word in words}))


def load_synonyms(config):
    """The groups of synonyms per language from search-synonyms.yml, next to mkdocs.yml."""
    path = os.path.join(os.path.dirname(config.config_file_path), SYNONYMS_FILE)
    if not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as file:
        return yaml.safe_load(file) or {}


def mentions(text, phrase):
    """Whether the text contains the word or phrase as a whole, not as part of a longer word."""
    return re.search(r"(?<!\w)" + re.escape(phrase) + r"(?!\w)", text) is not None


def synonyms_for(doc, groups):
    """All words of the synonym groups whose topic this title or text is about."""
    text = (plain_text(doc.get("title")) + " " + plain_text(doc.get("text"))).lower()
    found = []
    for group in groups:
        words = [str(word).lower() for word in group.get("words") or []]
        if any(mentions(text, word) for word in words):
            found += words + [str(word).lower() for word in group.get("also") or []]
    return " ".join(dict.fromkeys(found))  # without doubles, in the order of the file


def with_extra_words(doc, groups):
    doc = dict(doc)
    for field in ("title", "text"):
        variants = joined_variants(doc.get(field))
        if variants:
            doc[field + "_variants"] = variants
    synonyms = synonyms_for(doc, groups)
    if synonyms:
        doc["synonyms"] = synonyms
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

    synonyms = load_synonyms(config)

    # Search the extra words as much as the field they come from, so a match in a title still ranks first
    fields = dict(combined["config"].get("fields", {}))
    for field in ("title", "text"):
        if field in fields:
            fields[field + "_variants"] = fields[field]
    if "text" in fields:
        fields["synonyms"] = fields["text"]

    default = i18n.default_language
    folders = [language for language in i18n.build_languages if language != default]

    def language_of(location):
        # The pages of the other languages are in a folder named after the language, e.g. "nl/UsingYourBox/..."
        folder = location.split("/", 1)[0]
        return folder if folder in folders else default

    for language in i18n.build_languages:
        prefix = "" if language == default else language + "/"
        groups = synonyms.get(language) or []
        docs = [
            # Locations relative to the language's folder, which is where its pages look them up
            with_extra_words(dict(doc, location=doc["location"][len(prefix):]), groups)
            for doc in combined["docs"]
            if language_of(doc["location"]) == language
        ]
        index = dict(combined, docs=docs, config=dict(combined["config"], lang=[language], fields=fields))

        path = os.path.join(config.site_dir, prefix, "search", "search_index.json")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as file:
            json.dump(index, file, ensure_ascii=False, separators=(",", ":"))
