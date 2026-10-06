"""
MkDocs hook: copy each static file (images, css, js) only once per build.

With the i18n plugin, every language build copies all shared files into the site again, so each file is written
once per language (4x with en/nl/de/fr) within a fraction of a second. On Windows, overwriting a file that was just
written can fail with "OSError: [Errno 22] Invalid argument" while another program (typically the virus scanner
checking the new file) still has it open.

This skips a copy when the destination already is an up-to-date copy of the same file (written earlier in this
build), and retries a few times with a short pause when a copy fails anyway.
"""
import os
import time

import mkdocs.utils

_original_copy_file = mkdocs.utils.copy_file


def _copy_file_once(source_path, output_path):
    try:
        source, output = os.stat(source_path), os.stat(output_path)
        if source.st_size == output.st_size and output.st_mtime >= source.st_mtime:
            return  # already copied, e.g. by the build of another language
    except OSError:
        pass  # not copied yet

    attempts = 5
    for attempt in range(1, attempts + 1):
        try:
            return _original_copy_file(source_path, output_path)
        except OSError:
            if attempt == attempts:
                raise
            time.sleep(0.5)


def on_startup(command, dirty):
    # MkDocs calls mkdocs.utils.copy_file through the module, so replacing it here covers every copy
    mkdocs.utils.copy_file = _copy_file_once
