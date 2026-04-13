const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const siteDir = path.join(__dirname, "site");

// 🔥 Beide output locaties
const docsPdfDir = path.join(__dirname, "docs", "assets", "pdfs");
const sitePdfDir = path.join(siteDir, "assets", "pdfs");

// Recursively find all index.html files
function getHtmlFiles(dir, fileList = [])
{
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries)
    {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory())
        {
            if (entry.name === "pdfs") continue;
            getHtmlFiles(fullPath, fileList);
        }
        else if (entry.isFile() && entry.name === "index.html")
        {
            fileList.push(fullPath);
        }
    }

    return fileList;
}

// 🔥 EXACT dezelfde slug als frontend
function getSlug(htmlPath)
{
    const relative = path.relative(siteDir, path.dirname(htmlPath));

    if (!relative || relative === "")
        return null;

    return relative
        .replace(/[\\\/]+/g, "-")
        .toLowerCase();
}

(async () =>
{
    console.log("Starting PDF generation...");

    // Maak beide folders aan
    fs.mkdirSync(docsPdfDir, { recursive: true });
    fs.mkdirSync(sitePdfDir, { recursive: true });

    const browser = await chromium.launch();
    const page = await browser.newPage();

    const htmlFiles = getHtmlFiles(siteDir);

    for (const htmlFile of htmlFiles)
    {
        const slug = getSlug(htmlFile);
        if (!slug) continue;

        const relative = path.relative(siteDir, path.dirname(htmlFile));
        const route = relative.replace(/\\/g, "/");

        const url = route
            ? `http://127.0.0.1:8000/${route}/`
            : `http://127.0.0.1:8000/`;

        console.log(`Generating ${slug}.pdf`);

        await page.goto(url, { waitUntil: "networkidle" });
        await page.waitForTimeout(1200);
        await page.emulateMedia({ media: "print" });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "12mm",
                right: "12mm",
                bottom: "12mm",
                left: "12mm"
            }
        });

        // 🔥 schrijf naar beide locaties
        fs.writeFileSync(path.join(docsPdfDir, `${slug}.pdf`), pdfBuffer);
        fs.writeFileSync(path.join(sitePdfDir, `${slug}.pdf`), pdfBuffer);
    }

    await browser.close();

    console.log("Done! PDFs in docs/assets/pdfs en site/assets/pdfs");
})();