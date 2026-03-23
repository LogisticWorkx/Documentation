document.addEventListener("DOMContentLoaded", function ()
{
    // Detect homepage
    const isHome = window.location.pathname === "/" || window.location.pathname.endsWith("index.html");

    if (isHome) return; // ❌ don't show button on homepage

    const content = document.querySelector(".md-content__inner");
    if (!content) return;

    const container = document.createElement("div");
    container.style.marginTop = "40px";
    container.style.textAlign = "center";

    const button = document.createElement("button");
    button.innerText = "Download as PDF";
    button.style.background = "#b474b4";
    button.style.color = "white";
    button.style.border = "none";
    button.style.padding = "10px 16px";
    button.style.borderRadius = "6px";
    button.style.cursor = "pointer";

    button.onclick = () => window.print();

    container.appendChild(button);
    content.appendChild(container);
}); 