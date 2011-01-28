var regexLatin=/((?:s[u\u00fa]bs|tr[a\u00e1]ns|p[o\u00f3]st|[a\u00e1]bs|[o\u00f3]bs|[e\u00e9]x|(?:[cgq]u(?=[aeiouy\u00e1\u00e9\u00eb\u00ed\u00f3\u00fa\u00fd\u01fd\u00e6\u0153])|[bcdfghjklmnprstvwxz])*([a\u00e1]u|[ao][e\u00e9]?|[eiuy\u00e1\u00e9\u00eb\u00ed\u00f3\u00fa\u00fd\u00e6\u0153])(?:[\w\u00e1\u00e9\u00ed\u00f3\u00fa\u00fd]*(?=-)|(?=[bcdgptf][lr])|(?:[bcdfghjklmnpqrstvwxz]+(?=$|[^\w\u00e1\u00e9\u00ed\u00f3\u00fa\u00fd])|[bcdfghjklmnpqrstvwxz](?=[bcdfghjklmnprstvwxz]+))?)))(?:([\*-])|([^\w\s\u00e1\u00e9\u00ed\u00f3\u00fa\u00fd]+(?=\s|$))?)(\s*|$)/gi,
regexAccent=/[\u00e1\u00e9\u00ed\u00f3\u00fa\u00fd\u01fd]/i,regexToneGabc=/(')?(([^\sr]+)(r)?)(?=$|\s)/gi,sym_flex="\u2020",sym_med="*",algorithmTwoBefore=true,algorithmTwoAfter=false,bi_formats={html:{bold:["<b>","</b>"],italic:["<i>","</i>"]},tex:{bold:["{\\bf ","}"],italic:["{\\it ","}"]}},g_tones={"1":{mediant:"f gh hr 'ixi hr 'g hr h.",terminations:{D:"h hr g f 'gh gr gvFED.","D-":"h hr g f 'g gr gvFED.",D2:"h hr g f gr 'gf d.",f:"h hr g f 'gh gr gf.",g:"h hr g f 'gh gr g.",g2:"h hr g f 'g gr ghg.",
g3:"h hr g f 'g gr g.",a:"h hr g f 'g hr h.",a2:"h hr g f 'g gr gh..",a3:"h hr g f 'gh gr gh.."}},"2":{mediant:"e f h hr 'i hr h.",termination:"h hr g 'e fr f."},"3":{mediant:"g hj jr 'k jr jr 'ih j.",terminations:{b:"j jr h 'j jr i.",a:"j jr h 'j jr ih..",a2:"j jr ji hi 'h gr gh..",g:"j jr ji hi 'h gr g.",g2:"j jr h j i 'h gr g."}},"4":{mediant:"h gh hr g h 'i hr h.",terminations:{g:"h hr 'h gr g.",E:"h hr g h ih gr 'gf e."}},"4 alt":{mediant:"i hi ir h i 'j ir i.",terminations:{c:"i ir 'i hr h.",
A:"i ir h i j 'h fr f.","A*":"i ir h i j 'h fr fg..",d:"i ir h i j 'h ir i."}},"5":{mediant:"d f h hr 'i hr h.",termination:"h hr 'i gr 'h fr f."},"6":{mediant:"f gh hr 'ixi hr 'g hr h.",termination:"h hr f gh 'g fr f."},"6 alt":{mediant:"f gh hr g 'h fr f.",termination:"h hr f gh 'g fr f."},"7":{mediant:"hg hi ir 'k jr 'i jr j.",terminations:{a:"i ir 'j ir 'h hr gf..",b:"i ir 'j ir 'h hr g.",c:"i ir 'j ir 'h hr gh..",c2:"i ir 'j ir 'h hr ih..",d:"i ir 'j ir 'h hr gi.."}},"8":{mediant:"g h jr 'k jr j.",
terminations:{G:"j jr i j 'h gr g.","G*":"j jr i j 'h gr gh..",c:"j jr h j 'k jr j."}},"per.":{mediant:"ixhi hr g ixi h 'g fr f.",termination:"g gr d 'f fr ed.."}};function syllable(a){return{index:a.index,all:a[0],syl:a[1],vowel:a[2],separator:a[3],punctuation:a[4]?a[4]==":"?" :":a[4]:"",space:a[5],accent:a[3]=="*"||regexAccent.test(a[2])}}function toneGabc(a){return{index:a.index,all:a[0],accent:a[1]=="'",gabc:"("+a[2]+")",gabcClosed:"("+a[3]+")",open:a[4]=="r"}}
function getPsalmTones(){var a=[],h;for(h in g_tones)a.push(h);return a}function getEndings(a){var h=[];if((a=g_tones[a])&&a.terminations)for(var e in a.terminations)h.push(e);return h}function onOpen(){SpreadsheetApp.getActiveSpreadsheet().addMenu("Generate Psalm Tone",getTones())}
function getTones(){var a=SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tones");a=a.getRange(2,1,a.getMaxRows()-1,2).getValues();var h=[],e;for(e in a){var k=String(a[e][0]);if(k.length==0)break;h.push({name:k+"."+String(a[e][1]),functionName:"doToneRow1"})}return h}
function applyPsalmTone(a,h){for(var e=bi_formats.html,k=0,g=getSyllables(a),j=getGabcTones(h).tones,c=[],d=g.length-1,f,l=false,o=d+1,m=j.length-1;m>=0;--m,--d){var i=j[m],b=g[d];if(i.open){if(l)l=false;if(f&&f.accent){for(;!b.accent;){c.push(e.bold[0]+b.syl+e.bold[1]+b.punctuation+i.gabcClosed+b.space);--d;b=g[d]}f=undefined;c.push(b.space);c.push(i.gabc.slice(0,-1)+"[ocba:1;6mm])");if(b.accent){c.push(e.bold[0]+b.syl+e.bold[1]+b.punctuation);o=d}else c.push(b.syl+b.punctuation)}else{f=i;k=0;++d}}else if(i.accent){var n=
!f&&b.accent;l=false;if(f){for(var p=d;!b.accent;){--d;b=g[d]}b=o-d;if(b>3){if(algorithmTwoAfter)for(;b>3;){d+=2;b=o-d}else if(algorithmTwoBefore&&b>3)d=o-2;b=g[d];b.accent=true}d=p;for(b=g[d];!b.accent;){c.push(b.space);++k;g[d-1].accent&&k>1?c.push(f.gabc):c.push(f.gabcClosed);c.push(b.syl+b.punctuation);--d;b=g[d]}k<=1&&c.push(f.gabc+b.space);f=undefined}else if(!b.accent){f=i;k=0}c.push(e.bold[0]+b.syl+e.bold[1]+b.punctuation+i.gabc+b.space);f||(o=d);if(n)(i=j[--m])&&i.open&&c.push(i.gabc.slice(0,
-1)+"[ocba:1;6mm])")}else{if(f){for(;d>m;){c.push(b.syl+b.punctuation+f.gabcClosed+b.space);--d;b=g[d]}f=undefined}c.push(b.punctuation+i.gabc+b.space);if(!l&&j[m+1]&&(j[m+1].accent||j[m+1].open&&d>m))l=true;l?c.push(e.italic[0]+b.syl+e.italic[1]):c.push(b.syl)}}return c.reverse().join("")}
function getGabcTones(a){for(var h=[],e;e=regexToneGabc.exec(a);)h.push(toneGabc(e));for(var k=e=a=0,g=0,j=3,c=false,d=h.length-1;d>=0;--d){var f=h[d];if(f.accent){++e;j=1;if(c)c=false;else h[d-1].open&&--d}else if(f.open){if(j==3){g=0;j=2}c=true}else if(j==3)g++;else if(j==1)if(c)++a;else{++k;c=false}}return{tones:h,intonation:a,accents:e,preparatory:k,afterLastAccent:g}}function getSyllables(a){for(var h=[],e;e=regexLatin.exec(a);)h.push(syllable(e));getWords(h);return h}
function getWords(a){for(var h=a.length,e=[],k=[],g=0,j=0;j<h;++j){var c=a[j];e.push(c);c.accent&&++g;if(j==h-1||c.space&&c.space.length>0){if(g==0&&e.length==2)e[0].accent=true;else if(g==0&&e.length>2)for(g=0;g<e.length;++g){c=e[g];if(c.vowel=="\u00e6"||c.vowel=="\u0153"){c.accent=true;break}}k.push(e);e=[];g=0}}return k}
function addBoldItalic(a,h,e,k,g){k||(k=0);g=bi_formats[g];if(!g)g=bi_formats.html;for(var j=getSyllables(a),c=0,d=0,f=a.length,l,o=0,m=0,i=j.length-1,b=i+1;i>=0&&c<h;--i){var n=j[i];l=n.all.length;f=n.index;if(o<k){++o;if(o==k)m=f}else if(n.accent){var p=b-i;if(p>3){if(algorithmTwoAfter)for(;p>3;){i+=2;p=b-i}else if(algorithmTwoBefore)i=b-2;n=j[i];l=n.all.length;f=n.index;n.accent=true}b=i;p=n.syl;if(m!=0){l=m-f;p=a.substr(f,l);m=0}a=a.substr(0,f)+g.bold[0]+p+g.bold[1]+n.punctuation+n.space+a.substr(f+
l);++c}}for(l=f;i>=0&&d<e;--i){f-=j[i].all.length;++d}if(d>0){l-=f;a=a.substr(0,f)+g.italic[0]+a.substr(f,l)+g.italic[1]+a.substr(f+l)}return a}window.getPsalmTones=getPsalmTones;window.getEndings=getEndings;window.applyPsalmTone=applyPsalmTone;window.getSyllables=getSyllables;window.addBoldItalic=addBoldItalic;