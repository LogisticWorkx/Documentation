document.addEventListener("DOMContentLoaded", function ()
{
    const oldSwitcher = document.querySelector(".md-header__option");
    if (!oldSwitcher) return;

    // Hide original Material language switcher
    oldSwitcher.style.display = "none";

    const isDutch = window.location.pathname.startsWith("/nl/");
    const currentFlag = isDutch ? "🇳🇱" : "🇬🇧";

    let currentPath = window.location.pathname;

    let englishUrl = currentPath;
    let dutchUrl = currentPath;

    if (isDutch)
    {
        englishUrl = currentPath.replace(/^\/nl/, "") || "/";
        dutchUrl = currentPath;
    } else
    {
        englishUrl = currentPath;
        dutchUrl = "/nl" + currentPath;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "custom-language-switcher";

    wrapper.innerHTML = `
        <button class="custom-language-button" type="button">
            <span>${currentFlag}</span>
        </button>

        <div class="custom-language-menu">
            <a href="${englishUrl}">🇬🇧&nbsp;&nbsp;English</a>
            <a href="${dutchUrl}">🇳🇱&nbsp;&nbsp;Nederlands</a>
        </div>
    `;

    const headerInner = document.querySelector(".md-header__inner");
    const search = document.querySelector(".md-search");

    if (headerInner && search)
    {
        headerInner.insertBefore(wrapper, search);
    } else if (headerInner)
    {
        headerInner.appendChild(wrapper);
    }

    const button = wrapper.querySelector(".custom-language-button");

    wrapper.addEventListener("mouseenter", function ()
    {
        wrapper.classList.add("open");
    });

    wrapper.addEventListener("mouseleave", function ()
    {
        wrapper.classList.remove("open");
    });
});