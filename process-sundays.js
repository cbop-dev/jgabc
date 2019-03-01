"use strict";
var fs = require("fs"),
    empty = require('./texts.js'),
    stringSimilarity = require('string-similarity'),
    vr = require("./verseRef.js"),
    dirMain = '../divinum-officium-website/web/www/missa/Latin/',
    dirTempora = dirMain + 'Tempora/',
    dirSancti = dirMain + 'Sancti/',
    dirCommune = dirMain + 'Commune/',
    //vulgatePsalms = fs.readFileSync('psalms/vulgate','utf8').replace(regexNonWord,' ').toLowerCase().split('\n');
    proprium = require("./propersdata.js").proprium,
    keys = Object.keys(proprium),
    daysOfWeek = ' mtwhfs',
    notFound = [],
    missing = [],
    mapSpecial = {
      SMadvent: dirCommune+'C10a',
      SMchristmas: dirCommune+'C10b',
      SMlent: dirCommune+'C10c',
      SMeaster: dirCommune+'C10Pasc',
      SMpentecost: dirCommune+'C10',
      ChristusRex: dirSancti+'10-DU',
      votiveSCJ: dirTempora+'Pent02-5',
      SCJ: dirTempora+'Pent02-5',
      // votiveST: '',
      // votiveA: '',
      // votiveSS: '',
      // votiveSES: '',
      // votiveJCSES: '',
      // votiveSC: '',
      // votivePJC: '',
      // votiveJ: '',
      // votivePP: '',
      // votiveOA: '',
      // nuptialis: '',
      defunctorum: dirCommune+'C9',
      dedicatio: dirCommune+'C8',
      Epi: dirSancti+'01-06',
      Asc: dirTempora+'Pasc5-4',
      CorpusChristi: dirTempora+'Pent01-4',
      EmbWedSept: dirTempora+'093-3',
      EmbFriSept: dirTempora+'093-5',
      EmbSatSept: dirTempora+'093-6'
      // EmbSatSeptS: '',
      // Adv3ss: '',
      // Pasc7ss: '',
    },
    mapBooksWithNumber = {
      "Joann": "Joannis"
    },
    mapBooks = {
      "Act": "Actus Apostolorum",
      "Acts": "Actus Apostolorum",
      "Apoc": "Apocalypsis",
      "Cant": "Canticum Canticorum",
      "Col": "Ad Colossenses",
      "Cor": "Ad Corinthios",
      "Dan": "Daniel",
      "Deut": "Deuteronomium",
      "Eccli": "Ecclesiasticus",
      "Eph": "Ad Ephesios",
      "Ephes": "Ad Ephesios",
      "Esth": "Esther",
      "Exod": "Exodus",
      "Ezech": "Ezechiel",
      "Gal": "Ad Galatas",
      "Gen": "Genesis",
      "Ha": "Habacuc",
      "Heb": "Ad Hebræos",
      "Hebr": "Ad Hebræos",
      "Is": "Isaias",
      "Isa": "Isaias",
      "Isaiae": "Isaias",
      "Jac": "Jacobi",
      "Jas": "Jacobi",
      "Jer": "Jeremias",
      "Joann": "Joannes",
      "Joannes": "Joannes",
      "Joel": "Joel",
      "John": "Joannis",
      "Jonæ": "Jonas",
      "Jud": "Judæ",
      "Judith": "Judith",
      "Lev": "Leviticus",
      "Levit": "Leviticus",
      "Luc": "Lucas",
      "Mach": "Machabæorum",
      "Malach": 'Malachias',
      "Marc": "Marcus",
      "Matt": "Matthæus",
      "Mich": "Michæa",
      "Neh": "Nehemiæ",
      "Num": "Numeri",
      "Par": "Paralipomenon",
      "Pet": "Petri",
      "Petri": "Petri",
      "Phil": "Ad Philippenses",
      "Philipp": "Ad Philippenses",
      "Prov": "Proverbia",
      "Ps": "Psalmi",
      "Reg": "Regum",
      "Rom": "Ad Romanos",
      "Sap": "Sapientia",
      "Sir": "Ecclesiasticus",
      "Thess": "Ad Thessalonicenses",
      "Tim": "Ad Timotheum",
      "Tit": 'Ad Titum',
      "Tob": 'Tobiæ',
      "Tobias": 'Tobiæ',
      "Zach": "Zacharias"
},
    mapTitle = {},
    lex = {},
    partKey = {
      Introitus: 'in',
      Graduale: 'gr',
      Tractus: 'tr',
      Alleluia: 'al',
      Sequentia: 'seq',
      Offertorium: 'of',
      Communio: 'co'
    },
    regexForPart = {
      Introitus: /\[Introitus[A-Zd]*\]\n(?:\!([^\r\n]+))?\nv\.\s+((?:.*~\n)*(?:.*))\n\!([^\r\n]+)\n((?:.*~\n)*(?:.*))/g
    }

function getPropers(info) {
  Object.keys(partKey).forEach(part => {
    var partRegex = regexForPart[part] || new RegExp(`\\[${part}[A-Z\d]*\\]\\n[^\\r\\n]*\\n\\![^\\r\\n]+`,'g');
    var match;
    while(match = partRegex.exec(info)) {
      console.info(part, match[0])
    }
    // TODO: check all propers texts
    // TODO: check lectio refs as well
    var key = partKey[part];
    var txts = texts[part];
    var txtKeys = Object.keys(txts);
    var arrayOfChoices = txtKeys.map(k => txts[k]);
    var text = removeAcuteAccents(val.toLowerCase()).replace(/[^℣\sa-zæœ]+/g,'').replace(/\s+/g,' ').replace(/( ℣)? ps( ib(id)?)?\b/g,' ℣').replace(/( ℣)? gloria patri( .*)?$/,' gloria patri').replace(/\balleluja\b/g,'alleluia');
    var sim = stringSimilarity.findBestMatch(text, arrayOfChoices);
    var bestMatch = txtKeys[sim.bestMatchIndex];
    if(sim.bestMatch.rating > 0.6) {
      addProperty(obj,key+"ID", parseInt(bestMatch));
      if(sim.bestMatch.rating < 1) {
        addProperty(obj,key+"ID-rating", sim.bestMatch.rating);
        addProperty(obj,key+"ID-seekt", text);
        addProperty(obj,key+"ID-found", sim.bestMatch.target);
      }
    } else if(sim.bestMatch.rating > 0) {
      addProperty(obj,key+"ID-best", parseInt(bestMatch));
      addProperty(obj,key+"ID-rating", sim.bestMatch.rating);
      addProperty(obj,key+"ID-seekt", text);
      addProperty(obj,key+"ID-beest", sim.bestMatch.target);
    }
  });
}

keys.forEach(key => {
  if(/(Pasch|Quad)$/.test(key)) return;
  var dir = dirTempora;
  var k = key;
  var match = /^Pent(\d)(\D*)$/.exec(k);
  if(match && match[1]==='0') {
    k = `Pasc7${match[2]}`;
  } else if(match) {
    k = `Pent0${match[1]}${match[2]}`;
  }
  match = /^([567])a([mtwhfs]?)$/.exec(k);
  if(match) {
    k = `Quadp${8-match[1]}${match[2]}`;
  }
  match = /\d([mtwhfs])?$/.exec(k);
  var ending = '0';
  if(match && match[1]) {
    k = k.slice(0,-1);
    ending = daysOfWeek.indexOf(match[1]);
  }
  // check if from Sancti:
  match = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(\d+)(?:_(\d)|or\d+)?$/.exec(key);
  if(match) {
    dir = dirSancti;
    k = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec'.indexOf(match[1]) / 4;
    k = ('0' + (1+k)).slice(-2);
    ending = ('0' + match[2]).slice(-2);
    if(match[3]) ending += 'm' + match[3];
  }

  var fname = `${dir}${k}-${ending}.txt`;
  if(key in mapSpecial) {
    dir = '';
    k = mapSpecial[key];
    fname = k + '.txt';
  }

  var exists = fs.existsSync(fname);
  if(!exists) {
    if(key in mapSpecial) {
      throw fname;
    }
    fname = `${dir}${k}-${ending}r.txt`;
    exists = fs.existsSync(fname);
    if(!exists) {
      notFound.push(`${dir}${k}-${ending}.txt`);
      return;
    }
  }
  var info = fs.readFileSync(fname,'utf8');

  // TODO: check all propers texts
  // stringSimilarity.findBestMatch(string, arrayOfChoices)
  var regexLectiones = /\[(Lectio(?:L\d+)?|Evangelium)\]\n[^\r\n]*\n\![^~\n]+\n([^~\n]+~\n)*[^~\n]*\n/g;
  var lectiones = info.match(regexLectiones);
  while(!lectiones) {
    var reference = info.match(/\[Rule\]\n(.*[\n;](?!\n))*(vide|ex)\s+([^;\n]+)/);
    if(!reference) reference = info.match(/\[Rank1960\]\n(.*[\n;](?!\n))*(vide|ex)\s+([^;\n]+)/);
    if(!reference) reference = info.match(/\[Rank\]\n(.*[\n;](?!\n))*(vide|ex)\s+([^;\n]+)/);
    if(!reference) break;
    fname = reference[3];
    if(fname.indexOf('/') < 0) {
      if(/^C/.test(fname)) {
        fname = dirCommune + fname
      } else {
        fname = dir + fname;
      }
    } else {
      fname = dirMain + fname;
    }
    fname += '.txt';
    exists = fs.existsSync(fname);
    if(!exists) {
      throw 'Not found: ' + fname + ` (${k}-${ending}})`;
      return;
    }
    info = fs.readFileSync(fname,'utf8');
    lectiones = info.match(regexLectiones);
  }
  if(!lectiones) {
    missing.push(fname + ': ' + key);
    return;
  }
  lex[key] = lectiones.map(lectio => {
    var match = lectio.match(/(?:^|\n)!([^\r\n]+)\n((?:[^~\n]+~\n)*[^~\n]*)(?:\n|$)/);
    var ref = vr.parseRef(match[1]);
    var fullText = match[2].replace(/\s*~\n\s*/g,' ');
    var show = ref[0].book.match(/Eccli/);
    // console.info(fullText)
    var referencedVulgate = getReading(ref).replace(/\s+/g,' ');
    var similarity = stringSimilarity.compareTwoStrings(fullText, referencedVulgate);
    if(show || similarity < 0.4) {
      console.info(fname);
      console.info(`${ref.verseRefString()}: ${similarity}`)
      console.info('--');
      console.info(referencedVulgate);
      console.info('--');
      console.info(fullText);
      console.info('');
    }
    return ref.verseRefString();



    var match = /\n\s*([^\n\r\.]+)[\s\.P]*\n\s*\!((?:(\d)\s+)?((?:[\dIV]+\.?\s+)?([A-Z][a-zæœáéíóúýäëïöüÿ]+))\.?\s+([\dl:,; -]+))\.?\s*\n((?:[^~\n]+~\n)*[^~\n]*)(?:\n|$)/.exec(lectio);
    if(!match) throw lectio;
    var bookNumber = match[3];
    bookNumber = bookNumber? (bookNumber + ' ') : '';
    var bookAbbreviation = match[4];
    var numbers = match[6].replace(/l/g,'1');
    var title = mapTitle[bookAbbreviation];
    if(title && title != match[1]) {
      // console.info(bookAbbreviation, '\n', title, '\n' , match[1]);
    } else {
      mapTitle[match[5]] = match[1];
    }
    var fullText = match[7].replace(/\s*~\n\s*/g,' ');
    console.info(`${bookAbbreviation} ${numbers}: ${fullText}`);
    return `${bookNumber}${bookAbbreviation} ${numbers}`;
  });
});



function getReading(source) {
  var edition = 'vulgate';
  var language = 'la';
  return source.map(src => {
    if(src.bookNum && src.book in mapBooksWithNumber) {
      src.book = mapBooksWithNumber[src.book];
    } else if(src.book in mapBooks) {
      src.book = mapBooks[src.book];
    }
    var bookName = src.book;
    if(src.bookNum) bookName += ' ' + src.bookNum;
    var book = fs.readFileSync(edition+'/'+bookName,'utf8');

    var text = '';
    var wholeChapter = !src.verse;
    if(wholeChapter) src.verse = 1;
    var beginning = (src.chapter == 1 && src.verse == 1)? '' : '\n';
    var beginIndex = book.indexOf(`${beginning}${src.chapter}\t${src.verse}\t`);
    if(beginIndex < 0) {
      text += `${src.book} Verse ${src.chapter}: ${src.verse} was not found.\n`;
      return text;
    }
    if(beginning) beginIndex++;
    var temp = book.slice(beginIndex);
    var endIndex = 0;
    if(wholeChapter) {
      endIndex = temp.indexOf(`\n${src.chapter- -1}\t1\t`);
      if(endIndex < 0) endIndex = temp.length-1;
    } else if(src.endVerse) {
      endIndex = temp.indexOf(`\n${src.chapter}\t${src.endVerse}\t`) + 1;
    }
    endIndex = temp.indexOf('\n',endIndex);
    if(endIndex < 0) endIndex = temp.length;
    text += temp.slice(0,endIndex) + ' ';
    text = text.trim();
    return text.replace(/(^|\n)\d+\t\d+\t([^\n]+)/g,'$1$2');
  }).join(' ');
}

fs.writeFileSync('lectiones.js', `var lectiones = ${JSON.stringify(lex,0,' ')};
var mapTitleLectionis = ${JSON.stringify(mapTitle)}`, 'utf8');
//console.info(mapTitle);
//console.info(missing);
console.info(missing.length);
console.info(notFound);
console.info(notFound.length);