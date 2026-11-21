# The Film Archive — starter project

This is a static, retro late-2000s-style film catalogue. It does not host or play video. Each film can optionally link to an external Google Drive file.

## Quick preview on your computer
Open `index.html` in Chrome or Edge. The sample catalogue should appear. Some browser security settings may prevent loading a Google Sheet CSV from a local file; the sample catalogue still works.

## Publish for free with GitHub Pages
1. Create/sign in to a GitHub account at https://github.com/.
2. Click **New repository**.
3. Name it `film-archive` (or another name), choose **Public**, and create it.
4. On the new repository page, choose **Add file > Upload files**.
5. Extract this ZIP on your computer, then drag the CONTENTS of the `film_archive_starter` folder into the GitHub upload area. Upload `index.html`, `style.css`, `app.js`, `config.js`, `data.js`, and `README.md` (not the containing folder).
6. Click **Commit changes**.
7. In the repository, open **Settings > Pages**.
8. Under **Build and deployment**, choose **Deploy from a branch**. Select branch `main`, folder `/ (root)`, then **Save**.
9. Wait a few minutes. GitHub will show the public website address, usually `https://YOUR-USERNAME.github.io/film-archive/`.

## Use Google Sheets as your no-code catalogue editor
Create a Google Sheet. Put these exact headers in row 1, in this order:

`id,title,originalTitle,year,director,country,genres,collection,runtime,synopsis,cast,cinematography,screenplay,music,imdbRating,letterboxdRating,poster,driveUrl,imdbUrl,letterboxdUrl`

Each film is one row. Use:
- `collection`: `favorites` or `archive`
- `genres`: separate multiple genres with commas, e.g. `Drama, Romance`
- `poster`: a publicly accessible poster image URL
- `driveUrl`: share link to a film you are authorized to distribute
- `imdbUrl` and `letterboxdUrl`: links to the relevant film pages
- Leave unknown fields blank.

Then publish the sheet:
1. In Google Sheets, choose **File > Share > Publish to web**.
2. Select the sheet/tab containing the catalogue.
3. Select **Comma-separated values (.csv)**.
4. Click **Publish**, confirm, and copy the generated CSV URL.
5. Open `config.js` in your GitHub repository (click the pencil/edit icon).
6. Replace the empty value in `sheetCsvUrl` with the CSV URL, keeping the quotation marks.
7. Commit the change. The site will load its catalogue from the sheet.

Important: a published sheet is public. Do not put private information, passwords, private Drive folder links, or personal notes in it. Only put film metadata and links you intend to publish.

## Adding a film
Add a new row to the Google Sheet. The website will pick it up from the published CSV. It may take a short time for Google's published CSV to update.

## Film access and copyright
Google Drive sharing set to “Anyone with the link” makes the file accessible to anyone who obtains that link, not only visitors to this site. Only share films you own or are authorized to distribute. A public catalogue does not make copyrighted film files legal to redistribute. For private or restricted files, do not publish their Drive links.

## TMDB
The starter uses manually supplied poster URLs. Later, you can connect TMDB for metadata and artwork. Follow TMDB API terms and attribution requirements; do not assume IMDb or Letterboxd ratings can be freely harvested or redistributed.
