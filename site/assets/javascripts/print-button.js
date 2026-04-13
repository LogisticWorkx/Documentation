document.addEventListener("DOMContentLoaded", function ()
{
    const path = window.location.pathname;
    const parts = path.split("/").filter(Boolean);

    // Skip homepage
    if (parts.length === 0) return;

    const slug = parts.join("-");
    const pdfUrl = `/pdfs/${slug}.pdf`;

    const content = document.querySelector(".md-content__inner");
    if (!content) return;

    const container = document.createElement("div");
    container.className = "pdf-download-container";
    container.style.marginTop = "40px";
    container.style.textAlign = "center";

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.setAttribute("download", "");
    link.innerText = "Download as PDF";
    link.className = "pdf-download-button";

    // Optional: check if PDF exists
    fetch(pdfUrl, { method: "HEAD" })
        .then(res =>
        {
            if (!res.ok)
            {
                link.style.opacity = "0.5";
                link.innerText = "PDF not available";
                link.onclick = (e) => e.preventDefault();
            }
        })
        .catch(() =>
        {
            link.style.opacity = "0.5";
            link.innerText = "PDF not available";
            link.onclick = (e) => e.preventDefault();
        });

    container.appendChild(link);
    content.appendChild(container);
});