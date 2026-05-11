const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const baseUrl = "http://127.0.0.1:8000";
const siteDir = path.join(__dirname, "site");

const docsPdfDir = path.join(__dirname, "docs", "assets", "pdfs");
const sitePdfDir = path.join(siteDir, "assets", "pdfs");

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

function getRouteAndSlug(htmlPath)
{
    const relative = path.relative(siteDir, path.dirname(htmlPath));
    const normalized = relative.replace(/\\/g, "/");

    // Skip root homepage and Dutch language homepage
    if (!normalized || normalized === "." || normalized === "nl")
        return null;

    const route = `/${normalized}/`;
    const slug = normalized.replace(/[\\\/]+/g, "-").toLowerCase();

    return { route, slug };
}

function drawProgress(current, total)
{
    const percent = Math.round((current / total) * 100);
    const barLength = 30;
    const filled = Math.round((percent / 100) * barLength);

    const bar = "█".repeat(filled) + "-".repeat(barLength - filled);
    process.stdout.write(`\r[${bar}] ${percent}%  (${current}/${total})`);
}

(async () =>
{
    fs.mkdirSync(docsPdfDir, { recursive: true });
    fs.mkdirSync(sitePdfDir, { recursive: true });

    const allHtmlFiles = getHtmlFiles(siteDir);
    const pages = allHtmlFiles
        .map(getRouteAndSlug)
        .filter(Boolean);

    const browser = await chromium.launch();
    const page = await browser.newPage();

    console.log("Generating PDFs...");

    for (let i = 0; i < pages.length; i++)
    {
        const { route, slug } = pages[i];
        const url = baseUrl + route;

        drawProgress(i + 1, pages.length);

        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

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

        fs.writeFileSync(path.join(docsPdfDir, `${slug}.pdf`), pdfBuffer);
        fs.writeFileSync(path.join(sitePdfDir, `${slug}.pdf`), pdfBuffer);
    }

    await browser.close();

    console.log("\nPDF generation complete.");
})();