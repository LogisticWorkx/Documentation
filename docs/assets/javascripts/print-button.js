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

    button.onclick = async () =>
    {
        const original = document.querySelector(".md-content__inner");

        const clone = original.cloneNode(true);

        // Remove button from PDF
        clone.querySelectorAll("button").forEach(btn => btn.remove());

        // Clean layout
        clone.style.width = "800px"; // 🔥 IMPORTANT (fixed width)
        clone.style.margin = "0 auto";
        clone.style.background = "white";

        // Wrap it
        const wrapper = document.createElement("div");
        wrapper.style.padding = "20px";
        wrapper.appendChild(clone);

        document.body.appendChild(wrapper);

        try
        {
            await html2pdf().set({
                margin: [10, 10, 10, 10],
                filename: "documentation.pdf",
                html2canvas: {
                    scale: 1, // 🔥 LOWER = fixes offset
                    scrollY: 0
                },
                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "portrait"
                },
                pagebreak: {
                    mode: ["css", "legacy"]
                }
            }).from(wrapper).save();
        } catch (e)
        {
            console.error(e);
            alert("PDF failed");
        }

        document.body.removeChild(wrapper);
    };

    container.appendChild(button);
    content.appendChild(container);
}); 