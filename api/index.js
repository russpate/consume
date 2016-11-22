const express = require('express');
const request = require('request');
const cors = require('cors');
const compression = require('compression');

const DOMParser = require('xmldom').DOMParser;
const Vibrant = require('node-vibrant');
const stripTags = require('striptags');

const app = express();
const port = process.env.PORT || 3001;
const ITUNES_NS = "http://www.itunes.com/dtds/podcast-1.0.dtd";

app.use(cors());
app.use(compression());
app.disable('x-powered-by');

app.get('/', (req, res) => {
  res.status(404).json({ error: "Invalid endpoint" });
});

app.get('/podcast', (req, res) => {
  const url = req.query.url;
  if (! url.length) {
    res.status(404).json({ error: "URL is required" });
  } else {
    request(url, (error, response, body) => {
      if (! error && response.statusCode == 200) {
        const maxResults = req.query.max || -1;
        let parsed = parse(body, maxResults);
        parsed.colors.then(result => { // yuck. need to convert this to async/await
          parsed.colors = result;
          res.json(parsed);
        });
      } else {
        res.send(error);
      }
    });
  }
});

app.listen(port, () => {
  console.log(`CONSUME started. Listening on ${port}`);
});

const zeroFillToTwo = number => number < 10 ? `0${number}` : `${number}`;

const getDurationString = duration => {
  let timeComponent = [];
  Object
    .keys(duration)
    .forEach(key => duration[key] > 0 ? timeComponent.push(zeroFillToTwo(duration[key])) : "");
  return timeComponent.join(":");
};

const getColorPallete = imageUrl => {
  return new Promise((resolve, reject) => {
    Vibrant.from(imageUrl).getSwatches((err, pallete) => {
      /*
      Pallete Options
      ===============
      Vibrant
      Muted
      DarkMuted
      DarkVibrant
      LightMuted
      LightVibrant
      */

      const swatch = pallete.Muted || pallete.Vibrant; // Sometimes there's not enough image data to get Muted
      const titleTextColor = swatch.getTitleTextColor();
      const bodyTextColor = swatch.getBodyTextColor();
      const bgColor = swatch.getHex();
      const colors = { bgColor, titleTextColor, bodyTextColor }; 
      resolve(colors);
    });
  });
};

const parse = (text, maxResults) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");

  const channel = xml.getElementsByTagName("channel")[0];
  const title = channel.getElementsByTagName("title")[0].textContent;
  const link = channel.getElementsByTagName("link")[0].textContent;
  const description = (channel.getElementsByTagName("description")[0].textContent).trim();
  const imageUrl = channel.getElementsByTagNameNS(ITUNES_NS, "image")[0].attributes.getNamedItem("href").value;
  const rawEpisodes = channel.getElementsByTagName("item");
  const episodeCount = rawEpisodes.length;
  const max = maxResults == -1 ? episodeCount : Math.min(maxResults, episodeCount);

  let episodes = new Array(max);
  for (let i = 0; i < max; i++) {
    episodes[i] = (parseEpisode(rawEpisodes[i]));
  }

  const colors = getColorPallete(imageUrl);

  return {
    title,
    link,
    description,
    imageUrl,
    episodes,
    colors
  }
};

const parseEpisode = episode => {
  const itunesNS = ITUNES_NS;
  const duration = Number(episode.getElementsByTagNameNS(itunesNS, "duration")[0].textContent);

  const hours = Math.floor(duration / 3600); 
  const minutes = Math.floor((duration - hours * 3600) / 60);
  const seconds = (duration - hours * 3600) - minutes * 60;

  const description = episode.getElementsByTagName("description")[0].textContent;
  const shortDescription = parseShortDescription(description);

  const enclosureAttributes = episode.getElementsByTagName("enclosure")[0].attributes;
  const enclosure = {
    url: enclosureAttributes.getNamedItem("url").value,
    length: enclosureAttributes.getNamedItem("length").value,
    type: enclosureAttributes.getNamedItem("type").value
  };

  return {
    guid: episode.getElementsByTagName("guid")[0].textContent,
    title: episode.getElementsByTagName("title")[0].textContent,
    description,
    shortDescription,
    pubDate: new Date(episode.getElementsByTagName("pubDate")[0].textContent).getTime(),
    explicit: episode.getElementsByTagNameNS(itunesNS, "explicit")[0].textContent.toLowerCase() === "yes" ? true : false,
    duration: { hours, minutes, seconds },
    enclosure
  };
};

const parseShortDescription = description => {
  const firstBreakIndex = description.indexOf("<br");
  const cleanDescription = stripTags(description.replace(/<(BR|br)\s*\/?>/g, "\n").replace(/&nbsp;/g, " "));
  const cutoff = 150;
  let shortDescription = cleanDescription;

  if (firstBreakIndex !== -1) { // has line breaks
      shortDescription = shortDescription.substring(0, firstBreakIndex);
  } else {
    shortDescription = shortDescription.ellipsize(cutoff);
  }

  return shortDescription;
};

String.prototype.ellipsize = function(cutoff) {
  if (this.length > cutoff) {
    return `${this.substring(0, cutoff).trim()}...`;
  } else {
    return this;
  }
};
