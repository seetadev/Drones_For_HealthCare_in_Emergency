require('dotenv').config()

const express = require('express');
const session = require('express-session');
const genomeLink = require('genomelink-node');


const app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: 'YOURSECRET',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 60 * 1000
  }

}));

app.get('/', async (req, res) => {
  //TODO: change scope based on desired parameters
  const scope = "report:beta-carotene report:alpha-linolenic-acid report:iron report:phosphorus report:magnesium report:calcium report:folate report:response-to-vitamin-e-supplementation report:vitamin-e report:vitamin-d report:vitamin-b12 report:vitamin-a";
  const authorizeUrl = genomeLink.OAuth.authorizeUrl({ scope: scope });

  if (req.query.user_id) {
    req.session.userId = req.query.user_id;
  }
  // Fetching a protected resource using an OAuth2 token if exists.
  let reports = [];
  if (req.session.oauthToken) {
    const scopes = scope.split(' ');
    reports = await Promise.all(scopes.map(async (name) => {
      return await genomeLink.Report.fetch({
        name: name.replace(/report:/g, ''),
        population: 'european',
        token: req.session.oauthToken
      });
    }));
  }

  let geneomeLinkData = [];
  if (reports.length > 0) {


    for (let report of reports) {
      //create backaground colors
      let background_color;
      switch (report.summary.score) {
        case 0:
          background_color = "ec3e40"
          break;
        case 1:
          background_color = "ff9b2b"
          break;
        case 2:
          background_color = "f5d800"
          break;
        case 3:
          background_color = "377fc7"
          break;
        case 4:
          background_color = "01a46d"
          break;
        default:
          background_color = "fff";
      }

      //Get only the data we care about
      let reportData = {
        "display_name": report.phenotype.display_name,
        "summary_text": report.summary.text,
        "summary_score": report.summary.score,
        "url_name": report.phenotype.url_name,
        "category": report.phenotype.category,
        "background_color": background_color
      };
      geneomeLinkData.push(reportData);

    }

  }

  res.render('index', {
    authorize_url: authorizeUrl,
    reports: geneomeLinkData,
    user_id: req.session.userId,
  });
});

app.get('/callback', async (req, res) => {
  // The user has been redirected back from the provider to your registered
  // callback URL. With this redirection comes an authorization code included
  // in the request URL. We will use that to obtain an access token.
  req.session.oauthToken = await genomeLink.OAuth.token({ requestUrl: req.url });

  // At this point you can fetch protected resources but lets save
  // the token and show how this is done from a persisted token in index page.
  res.redirect('/')
});

// Run local server on port 3000.
const port = process.env.PORT || 3000;
const server = app.listen(port, function () {
  console.log('Server running at http://127.0.0.1:' + port + '/');
});
