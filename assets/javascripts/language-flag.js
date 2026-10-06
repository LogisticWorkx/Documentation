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

function germanFlag()
{
    return `<svg class="lang-flag" viewBox="0 0 9 6" aria-hidden="true">
        <rect width="9" height="6" fill="#FFCE00"/>
        <rect width="9" height="4" fill="#DD0000"/>
        <rect width="9" height="2" fill="#000000"/>
    </svg>`;
}

function frenchFlag()
{
    return `<svg class="lang-flag" viewBox="0 0 9 6" aria-hidden="true">
        <rect width="9" height="6" fill="#EF4135"/>
        <rect width="6" height="6" fill="#FFFFFF"/>
        <rect width="3" height="6" fill="#0055A4"/>
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

// The site's languages, in menu order. English is the default and lives at the root, the others under /<code>/.
// Keep in sync with the i18n languages in mkdocs.yml.
const languages = [
    { code: "en", name: "English", flag: britishFlag },
    { code: "nl", name: "Nederlands", flag: dutchFlag },
    { code: "de", name: "Deutsch", flag: germanFlag },
    { code: "fr", name: "Français", flag: frenchFlag }
];

document.addEventListener("DOMContentLoaded", function ()
{
    const oldSwitcher = document.querySelector(".md-header__option");
    if (!oldSwitcher) return;

    // Hide original Material language switcher
    oldSwitcher.style.display = "none";

    // Which language is this page in, and what's the page's path without the language part
    const currentPath = window.location.pathname;
    const firstPart = currentPath.split("/").filter(Boolean)[0];
    const current = languages.find(l => l.code !== "en" && l.code === firstPart) || languages[0];
    const pagePath = current.code === "en" ? currentPath : (currentPath.substring(current.code.length + 1) || "/");

    // The same page in another language
    function urlFor(language)
    {
        return language.code === "en" ? pagePath : "/" + language.code + pagePath;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "custom-language-switcher";

    wrapper.innerHTML = `
        <button class="custom-language-button" type="button" aria-label="${current.name}">
            ${current.flag()}
        </button>

        <div class="custom-language-menu">
            ${languages.map(l => `<a href="${urlFor(l)}">${l.flag()}${l.name}</a>`).join("")}
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

    wrapper.addEventListener("mouseenter", function ()
    {
        wrapper.classList.add("open");
    });

    wrapper.addEventListener("mouseleave", function ()
    {
        wrapper.classList.remove("open");
    });
});
