// The search field in the middle of the homepage (overrides/home.html).
//
// It doesn't have a search of its own: what you type is passed on to the site search in the header, and that
// search's results are shown right under this field instead of at the top of the page. When the header search is
// used (e.g. on a phone, or with the "/" key), the results go back up there.
document.addEventListener("DOMContentLoaded", function ()
{
    const form = document.querySelector(".tw-search");
    const field = form && form.querySelector(".tw-search__input");
    const panel = form && form.querySelector(".tw-search__results");
    const siteSearch = document.querySelector(".md-search__input");
    const results = document.querySelector(".md-search__output");
    if (!field || !panel || !siteSearch || !results) return;

    const resultsHome = results.parentElement;

    // Phones get the shorter placeholder, e.g. "Search..."
    const phone = window.matchMedia("(max-width: 44.984375em)");
    function updatePlaceholder()
    {
        field.placeholder = phone.matches ? field.dataset.placeholderShort : field.dataset.placeholder;
    }
    updatePlaceholder();
    phone.addEventListener("change", updatePlaceholder);

    function setOpen(open)
    {
        form.classList.toggle("tw-search--open", open);
    }

    function showResultsHere()
    {
        if (results.parentElement !== panel) panel.appendChild(results);

        // Material only shows the list of results while the header search is open, so show it here ourselves
        const list = results.querySelector(".md-search-result__list");
        if (list)
        {
            list.hidden = false;
            list.setAttribute("role", "list");
        }
    }

    // Search as you type, with the site search
    field.addEventListener("input", function ()
    {
        showResultsHere();
        siteSearch.value = field.value;
        siteSearch.dispatchEvent(new Event("input", { bubbles: true }));
        siteSearch.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
        setOpen(field.value.trim() !== "");
    });

    field.addEventListener("focus", function ()
    {
        showResultsHere();
        setOpen(field.value.trim() !== "");
    });

    field.addEventListener("keydown", function (event)
    {
        if (event.key === "Escape")
        {
            setOpen(false);
        }
        else if (event.key === "ArrowDown")
        {
            // Into the results; from there Tab and Shift+Tab go through them
            const first = results.querySelector(".md-search-result__link");
            if (first)
            {
                event.preventDefault();
                first.focus();
            }
        }
    });

    // Enter or the button opens the best match
    form.addEventListener("submit", function (event)
    {
        event.preventDefault();
        const first = results.querySelector(".md-search-result__link");
        if (first) window.location.href = first.href;
    });

    // Close when clicking or tabbing somewhere else
    document.addEventListener("click", function (event)
    {
        if (!form.contains(event.target)) setOpen(false);
    });

    form.addEventListener("focusout", function (event)
    {
        if (!form.contains(event.relatedTarget)) setOpen(false);
    });

    form.addEventListener("keydown", function (event)
    {
        if (event.key === "Escape")
        {
            setOpen(false);
            field.focus();
        }
    });

    // The header search is used: its results go back up there, and it starts empty instead of with what was typed here
    siteSearch.addEventListener("focus", function ()
    {
        setOpen(false);
        if (results.parentElement === resultsHome) return;

        resultsHome.appendChild(results);
        if (siteSearch.value === field.value)
        {
            siteSearch.value = "";
            siteSearch.dispatchEvent(new Event("input", { bubbles: true }));
            siteSearch.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
        }
    });
});
