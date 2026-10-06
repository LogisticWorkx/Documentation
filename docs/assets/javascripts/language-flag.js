// Flags as small inline SVGs instead of emoji: Windows has no flag emoji, so Chrome, Edge and the launcher's
// built-in browser (WebView2) showed "GB" / "NL" letters instead of flags.
let flagCount = 0;

function dutchFlag()
{
    return `<svg class="lang-flag" viewBox="0 0 9 6" aria-hidden="true">
        <rect width="9" height="6" fill="#21468B"/>
        <rect width="9" height="4" fill="#FFFFFF"/>
        <rect width="9" height="2" fill="#AE1C28"/>
    </svg>`;
}

function britishFlag()
{
    // The clip paths need an id that's unique on the page, this flag is shown more than once
    const id = "lang-flag-gb-" + (++flagCount);
    return `<svg class="lang-flag" viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <clipPath id="${id}-s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
        <clipPath id="${id}-t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
        <g clip-path="url(#${id}-s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" stroke-width="6"/>
            <path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#${id}-t)" stroke="#C8102E" stroke-width="4"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" stroke-width="10"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/>
        </g>
    </svg>`;
}

document.addEventListener("DOMContentLoaded", function ()
{
    const oldSwitcher = document.querySelector(".md-header__option");
    if (!oldSwitcher) return;

    // Hide original Material language switcher
    oldSwitcher.style.display = "none";

    const isDutch = window.location.pathname.startsWith("/nl/");
    const currentFlag = isDutch ? dutchFlag() : britishFlag();

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
        <button class="custom-language-button" type="button" aria-label="${isDutch ? "Nederlands" : "English"}">
            ${currentFlag}
        </button>

        <div class="custom-language-menu">
            <a href="${englishUrl}">${britishFlag()}English</a>
            <a href="${dutchUrl}">${dutchFlag()}Nederlands</a>
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