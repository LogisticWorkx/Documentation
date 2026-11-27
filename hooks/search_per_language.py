"""
MkDocs hook: a separate search index per language, so a search on a Dutch page only finds Dutch pages.

The i18n plugin builds the languages one after the other and puts the pages of all of them in one search index,
site/search/search_index.json. After that, this hook splits that index up: the default language (English, at the
root of the site) keeps search/search_index.json with only its own pages, and every other language gets its own
<language>/search/search_index.json. The pages of a language load the index in their own folder, because
overrides/main.html points their search there.
"""
import json
import os

from mkdocs.plugins import event_priority


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
            dict(doc, location=doc["location"][len(prefix):])
            for doc in combined["docs"]
            if language_of(doc["location"]) == language
        ]
        index = dict(combined, docs=docs, config=dict(combined["config"], lang=[language]))

        path = os.path.join(config.site_dir, prefix, "search", "search_index.json")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as file:
            json.dump(index, file, ensure_ascii=False, separators=(",", ":"))
