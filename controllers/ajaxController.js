var ciscenje = require('../models/ciscenje');
var createConnection = require('../models/baza');

const logika = (req, res) => {

  //console.log('u ajaks kontroleru');

  let zadatak = req.query.id;

  switch (zadatak) {
    case ('pregled_testa'):
      rezultat = pregled_testa(req);
      res.write(rezultat);
      res.end();
      break;
    case ('o1m_1_10'):
      rezultat = o1m_1_10(req);
      res.write(rezultat);
      res.end();
      break;
    case ('o1m_1_10txt'):
      rezultat = o1m_1_10txt(req);
      res.write(rezultat);
      res.end();
      break;
    case ('s1m_kombi'):
      rezultat = s1m_kombi(req);
      res.write(rezultat);
      res.end();
      break;
    case ('pite'):
      nesto = pite(req);
      nesto.then(function(result) {
        rezultat = result;
        res.write(rezultat);
        res.end();
        //console.log(result) // "Some User token"
      });
      break;
    default:
      rezultat = 'Ajax we have a problem!';
      break;
  }

  // res.write(rezultat);
  // res.end();
 
}



// pravi zadatke iz kombinatorike
function s1m_kombi (req) {

  if (req.query.faza == 'novi') {

    let kombi = rndInt(1, 3);
    //kombi = 2;
    console.log('kombi:'+kombi);

    let c = '';
    let ponavljanje;
    let broj_elemenata;
    let cifara

    //$svi = rand(0, 1) == 0 ? "prvih " . rand(cifara, 9) : "svih";
    //$raspored = rand(0, 1) == 0 ? "nije bitan" : "jeste bitan";
    //ponavljanje = rand(0, 1) == 0 ? "ne ponavljaju" : "ponavljaju";

    //$rez;
    let pzpn;
    let html = '';

    // echo "svi: " . $svi_elementi . ", raspored: ". bitan_raspored . ", ponavljanje: " . ponavljanje . "<br>";
    // print_r($e);

    switch (kombi) {

      case 1: //permutacije
        broj_elemenata = rndInt(5, 9);
        cifara = broj_elemenata;

        if (rndInt(0, 1) == 0) { //random brojevi sa ponavljanjem
          let c1 = [ //cifre
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9)
          ];
          //console.log('c1:' + c1.length + ' ' + c1);
          c = array_rand(c1, broj_elemenata);
          let da_se_kopira = rndInt(0, c.length-1);
          for (let i = 0; i < rndInt(1, 2); i++) { c[i] = c[da_se_kopira]; }
          ponavljanje = "ponavljaju";
          //console.log('c1: '+ c1);
        } else { //random brojevi sa ponavljanjem
          // let c2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          // shuffle(c2);
          // js analogija za php shuffle ne radi pa mora lažni
          let c2 = shuffle();
          //console.log('c2: '+c2.length);
          c = array_rand(c2, broj_elemenata);
          ponavljanje = "ne ponavljaju";
          //console.log('c2: '+ c2);
        }

        //console.log('c: '+ c);

        let deljivih = "";
        pzpn = "";
        let tip = rndInt(1, 2);
        
        //tip = 1; //////

        switch (tip) {

          case 1: //  prvi, zadnji, parni, neparni, deljivi
            
            deljivih = rndInt(0, 1);
            if (deljivih == 0) { // prva/zadnja n parna/neparna
              deljivih = "";
              pzpn = rndInt(0, 1) == 0 ? "ako su prva " + rndInt(2, 4) : "ako su zadnja " + rndInt(2, 4);
              pzpn = rndInt(0, 1) == 0 ? pzpn + " broja parna i " : pzpn + " broja neparna i ";
            }
            else { // n cifreni deljivi sa n 
              deljivih = "deljivih sa " + rndInt(2, 5) + " ";
            }

            html = "";

            html = "<br>Koliko " + cifara + " cifrenih brojeva " +
            deljivih +
            "može da se dobije od cifara<br>" +
            "<table><tr>";
            //console.log('c: ' + c.length);
            for (let i = 0; i < c.length; i++) {
              html = html + "<td style='border: 1px solid black; padding: 3px;'>" + c[i] + "</td>";
            }
            html = html + "</tr></table>" +
            pzpn +
            "ako se cifre " + ponavljanje + "?" +
            "<table>" +
            "<br><br>" +
            "<img src='../permutacije.gif'>" + "<br>" +
            "<audio controls autoplay>" +
            "<source src='../Kenndog - Beethoven (Lyrics) if you see the homies with the guap.mp3' type='audio/mpeg'>" +
            "</audio>";
            
            break;

          case 2: // tekstualni
            let t1 = ["Na polici ", "U šupi", "U sobi", "U korpi", "U frižideru"];
            let t2 = ["knjige", "mačke", "sveće", "jabuke", "veštice"];
            let t11 = t1[rndInt(0, 4)];
            t22 = t2[rndInt(0, 4)];

            let t3 = ["vatrene: ", "žute: ", "grozne: ", "plave: ", "glupe: ", "crvene: " , "divne: ", "zelene: "];
            t33 = "";
              let b1 = rndInt(0, 7);
              let b2 = rndInt(0, 7);
              if (b1 == b2) {
                if (b1 < 4) {
                  b2 = b1 + 1;
                } else {
                  b2 = b1 - 1;
                }
              }
              t31 = t3[b1];
              t32 = t3[b2];
              b3 = rndInt(0, 7);
              if (b3 == b1 || b3 == b2) {
                for (let i = 0; i < 20; i = i + rndInt(1, 2)) {
                  let treci = rndInt(0, 5);
                  if (t3[treci] != t31 || t3[treci] != t32) {
                    t33 = t3[treci];
                  }
                }
              } else {
                t33 = t3[b3];
              }
            
            html = '';

            html = html + "<br>" +
            t11 + " se nalaze " + t22 + " sledećih boja:<br>" +
            t31 + rndInt(1, 5) + ", " +
            t32 + rndInt(1, 5) + " i " +
            t33 + rndInt(1, 5) + ".<br>" +
            "Na koliko načina se one mogu rasporediti tako da " + t22 + " iste boje budu jedna do druge?" +
            "<br><br>" +
            "<img src='../patke.webp'><br>" +
            "<audio controls autoplay>" +
            "<source src='../Rokeri s Moravu - Krkenzi kikiriki evri dej.mp3' type='audio/mpeg'>" +
            "</audio>";
            break;

          default:
              break;
        }

        break;

      case 2:
        //echo "varijacije";
        broj_elemenata = rndInt(0, 9);
        cifara = rndInt(3, 9);

        if (rndInt(0, 1) == 0) { //rand brojevi sa ponavljanjem
          c1 = [ //cifre
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9),
            rndInt(0, 9)
        ];
          c = array_rand(c1, c1.length);
          let da_se_kopira = rndInt(0, c.length-1); //radi dupliranja nekih random elemenata
          for (let i = 0; i < rndInt(1, 2); i++) { c[i] = c[da_se_kopira]; }
          ponavljanje = "ponavljaju";
        } else {
          // let c2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          // shuffle(c2);
          // js analogija za php shuffle ne radi pa mora lažni
          let c2 = shuffle();
          c = array_rand(c2, c2.length);
          ponavljanje = "ne ponavljaju";
        }

        let pn = "";
        pzpn = "";

        if (rndInt(1, 2) == 1) { //samo parni/neparni ili prvih/zadnjih parnih/neparnih
          pn = rndInt(0, 1) == 0 ? " parnih" : " neparnih";
        } else {
          pzpn = rndInt(0, 1) == 0 ? "ako su prva " + rndInt(2, 4) : "ako su zadnja " + rndInt(2, 4);
          pzpn = rndInt(0, 1) == 0 ? pzpn + " broja parna i " : pzpn + " broja neparna i ";
        }
            
        html = "";
        html = html + "<br>" +
        "Koliko " + cifara + " cifrenih" + pn + " brojeva " +
        "može da se dobije od cifara<br>" +
        "<table><tr>";
        //console.log('c: ' + c.length);
        for (let i = 0; i < c.length ; i++) {
          html = html + "<td style='border: 1px solid black; padding: 3px;'>" + c[i] + "</td>";
        }
        html = html + "</tr></table>" +
        pzpn +
        "ako se cifre " + ponavljanje + "?" +
        "<table>" +
        "<br><br>" +
        "<img src='../varijacije.gif'><br>" +
        "<audio controls autoplay>" +
        "<source src='../Sammy K - Fatal Attraction (Lyrics) hell naw better believe i aint that one.mp3' type='audio/mpeg'>" + 
        "</audio>";
        
        break;

      case 3:
        html = "";
        html = html + "čekamo kombinacije :)<br><br>" +
        "<img src='../kombinacije.gif'>";
        break;

      default:
        break;
    }

    return html;


  } else if (req.query.faza == 'resenje') {

    let {a, b, r} = JSON.parse(req.body.abr);

    var rr = a + b;
    var tacno = 0;

    if (rr == r) {
      tacno = 1;
    } else {
      tacno = 0;
    }

    let gif = "";
    let zvuk = "";

    if (tacno == 1) {
        gif = "<img src='/hepi.gif'>";
        zvuk = "\
            <audio controls autoplay>\
              <source src='/slavuj2.mp3' type='audio/mpeg'>\
            </audio>";
    } else {
        gif = "<img src='/sad.gif'>";
        zvuk = "\
            <audio controls autoplay>\
              <source src='/beba.mp3' type='audio/mpeg'>\
            </audio>";
    }
  
    html = gif + "<br>" + zvuk;

    return JSON.stringify({rr, html});

  }

}



// pravi tekstualne zadatke 1-10 i proverava rešenje
function o1m_1_10txt (req) {

  if (req.query.faza == 'novi') {

    let a = rndInt(2, 10);
    let b = rndInt(2, 10);
    let c;
    let html = ""

    let t1 = ["Марко", "Mајмун", "Милош", "Kрокодил", "Стефан", "Слепи миш", "Илија", "Слон", "Јован", "Горила"];

    let t2 = ["Маша", "жирафа", "Јелена", "хијена", "Ивана", "чапља", "Милена", "кокошка", "Наташа", "овца"];
    
    let t3 = ["камиончића", "ексера", "колача", "чекића", "динара", "фломастера" , "лизала", "цветића", "лептирића", "ћевапчића"];
    
    let t11 = t1[rndInt(0, 9)];
    let t22 = t2[rndInt(0, 9)];
    let t33 = t3[rndInt(0, 9)];

    while (a+b > 10) {
      a = rndInt(2, 10);
      b = rndInt(2, 10);
    }

    html = "<img width='525' src='../brojevna-prava2.png'><br><p style='font-size: x-large'>";

    if (a > b) {
      c = a - b;
      html = html + t11 + " има " + a + " " + t33 + " a " + t22 + " " + c + " мање. Колико имају заједно?";
    } else {
      c = b - a;
      html = html + t11 + " има " + a + " " + t33 + " a " + t22 + " " + c + " више. Колико имају укупно?";
    }

    html = html + "</p><br><input type='number' min='0' max='10' style='font-size:20px' id='r' name='r' value=''>" +
    "</table>\
    <table>\
      <tr>\
        <td style='border: 0px solid black'>\
        <button class='button button2' onclick='resenje(" + a + "," + b + ")'>Решење:</button>\
        </td>\
        <td width='50px' style='font-size:20px' id='rez' style='border: 0px solid black'></td>\
      </tr>\
    </table>";

    return html;

  } else if (req.query.faza == 'resenje') {

    let {a, b, r} = JSON.parse(req.body.abr);

    var rr = a + b;
    var tacno = 0;

    if (rr == r) {
      tacno = 1;
    } else {
      tacno = 0;
    }

    let gif = "";
    let zvuk = "";

    if (tacno == 1) {
        gif = "<img src='/hepi.gif'>";
        zvuk = "\
            <audio controls autoplay>\
              <source src='/slavuj2.mp3' type='audio/mpeg'>\
            </audio>";
    } else {
        gif = "<img src='/sad.gif'>";
        zvuk = "\
            <audio controls autoplay>\
              <source src='/beba.mp3' type='audio/mpeg'>\
            </audio>";
    }
  
    html = gif + "<br>" + zvuk;

    return JSON.stringify({rr, html});

  }

}



// pravi brojčane zadatke 1-10 i proverava rešenje
function o1m_1_10 (req) {

  if (req.query.faza == 'novi') {

    let a = Math.floor(Math.random() * 11); //kao rand(0, 10); u php jer daje 0,324 islične brojeve
    let op1 = Math.floor(Math.random() * 2);
    let b = Math.floor(Math.random() * 11);

    if (op1 == 0) {
      if (a < b) {
        tmp = a;
        a = b;
        b = tmp;
      }
    } else {
      while (a+b > 10) {
        a = Math.floor(Math.random() * 11);
        b = Math.floor(Math.random() * 11);
      }
    }
    
    let op2;
    
    if (op1 == 0) {
      op2 = "-";
    } else {
      op2 = "+";
    }

    html_zadatak = "<table style='font-size:20px'>\
    <img width='525' src='/brojevna-prava2.png'>\
    <tr>\
      <td>" + a + "</td>\
      <td>" + op2 + "</td>\
      <td>" + b + "</td>\
      <td>=</td>\
      <td><input size='2' type='number' min='0' max='10' style='font-size:20px' id='r' name='r' value=''></td>\
    </tr>\
    </table>\
    <table>\
      <tr>\
        <td style='border: 0px solid black'>\
        <button class='button button2' onclick='resenje(" + a + "," + "\"" + op2 + "\"" + "," + b + ")'>Решење:</button>\
        </td>\
        <td width='50px' style='font-size:20px' id='rez' style='border: 0px solid black'></td>\
      </tr>\
    </table>"

    return html_zadatak;

  } else if (req.query.faza == 'resenje') {

    // prijem = JSON.parse(req.body.aopbr);
    // let {a, op, b, r} = prijem;
    let {a, op, b, r} = JSON.parse(req.body.aopbr);

    var rr = "";

    var tacno = 0;
    if (op == '-') {
      var rr = a - b;
    } else {
      var rr = a + b;
    }
    
    if (rr == r) {
      tacno = 1;
    } else {
      tacno = 0;
    }

    let gif = "";
    let zvuk = "";

    //echo $rez;

    if (tacno == 1) {
        gif = "<img src='/hepi.gif'>";
        zvuk = "\
            <audio controls autoplay>\
              <source src='/slavuj2.mp3' type='audio/mpeg'>\
            </audio>";
    } else {
        gif = "<img src='/sad.gif'>";
        zvuk = "\
            <audio controls autoplay>\
              <source src='/beba.mp3' type='audio/mpeg'>\
            </audio>";
    }
    
    html_resenje = gif + "<br>" + zvuk;

    // let send = {rr, html_resenje}
    // sendJ = JSON.stringify(send);
    // return sendJ;
    return JSON.stringify({rr, html_resenje});

  }

}



// prvo čita podatke za odabrani test ili pitanja onda upisuje update
async function pite (req) {

  let id = JSON.parse(req.body.rb);
  let generalije;
  let results_niz = [];
  let row;
  let rowJ = '';
  let results;

  //console.log('id', id)

  if (req.query.akc == 'read') {

    //https://stackoverflow.com/questions/44004418/node-js-async-await-using-with-mysql
    //https://stackoverflow.com/questions/38884522/why-is-my-asynchronous-function-returning-promise-pending-instead-of-a-val

    const mysql = require('mysql2/promise');

    const conn = await mysql.createConnection({
      host: process.env.FREE_MYSQL_HOST,
      port: process.env.FREE_MYSQL_PORT,
      user: process.env.FREE_MYSQL_USER,
      password: process.env.FREE_MYSQL_PASSWORD,
      database: process.env.FREE_MYSQL_DATABASE,
      connectionLimit: 1000,
      debug: false,
      waitForConnections: true,
      queueLimit: 0
    });

    sql_prepared_data = [];
    sql_prepared_data = [id];

    let [results0] = await conn.execute('SELECT * FROM g_pitanja_c_testovi WHERE g_id = ?;', sql_prepared_data);
    
    results = results0;


  }

  p = 1; //broj proverenih pitanja u for petlji
  index = 0; //indeks niza
  //let results_niz = [];
  generalije = {
    rb: results[0].g_id,
    tip: results[0].tip,
    smer: results[0].obrazovni_profil,
    razred: results[0].razred,
    predmet: results[0].predmet,
    oblast: results[0].oblast,
    link1: results[0].link1,
    link2: results[0].link2,
    link3: results[0].link3
  }

  results.forEach(element => {
    for (const property in element) {
      if (property.includes('pitanje_')) {
        if (element['pitanje_'+p] != '') {
          let obj = {};
          obj[property] = element[property];
          if (element['odg_'+p+'_1'] != '') {
            obj['odg_'+p+'_1'] = element['odg_'+p+'_1'];
          }
          if (element['odg_'+p+'_2'] != '') {
            obj['odg_'+p+'_2'] = element['odg_'+p+'_2'];
          }
          if (element['odg_'+p+'_3'] != '') {
            obj['odg_'+p+'_3'] = element['odg_'+p+'_3'];
          }
          if (element['odg_'+p+'_4'] != '') {
            obj['odg_'+p+'_4'] = element['odg_'+p+'_4'];
          }
          if (element['r_'+p] != '') {
            obj['r_'+p] = element['r_'+p];
          }
          results_niz[index] = obj;
          index++;
          p++;
        }
      }
    }
    p = 1;
  });

  row = {gen: generalije, niz: results_niz}
  rowJ = JSON.stringify(row);

  return rowJ;

}



// pregleda rešen test i šalje rezultate i statistiku
function pregled_testa (req) {

  // o ajax, XMLHttpRequest(), formData itd. sa frontenda
  //https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
  //https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData
  //https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send
  //Or you can specify the optional form argument when creating the FormData object, to prepopulate it with values from the specified form
  // ovo dole lepo radi ali nije funkcionalno jer nije niz i mora da se konvertuje ručno
  //let form = document.getElementById('t_auto_test');
  //let formData = new FormData(form);
  //https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
  //XMLHttpRequest.response
  //Returns an ArrayBuffer, Blob, Document, JavaScript object, or a DOMString, depending on the value of XMLHttpRequest.responseType, that contains the response entity body.

  // o backend preuzimanju query ili body iz http ali je komplikovano i uz 3rd party pa sam išao preko
  // ajax, XMLHttpRequest() i FormData
  //https://nodejs.org/en/knowledge/HTTP/clients/how-to-access-query-string-parameters/
  //https://stackoverflow.com/questions/40309898/nodejs-getting-object-object-from-request
  //https://stackoverflow.com/questions/37919270/send-javascript-object-with-ajax
  //https://stackoverflow.com/questions/53797006/undefined-data-when-sending-javascript-object-with-ajax

  let test = JSON.parse(req.body.test);
  let bp = test.length; //broj pitanja
  let rez_testa = JSON.parse(req.body.rez_testa);

  // console.log(test);
  // console.log(rez_testa);

  let tacnih_odgovora = 0;
  let tabela = '<table>';
  tabela += '<tr><td style="background-color: LightCyan;">Tačan odgovor korisnika</td>\
  <td style="background-color: LightGreen; text-align: center;">&#10004</td></tr>\
  <tr><td style="border: 0px solid white;"></td></tr>\
  <tr><td style="background-color: LavenderBlush;">Pogrešan odgovor</td>\
  <td style="background-color: red; text-align: center;">&#10008</td></tr>\
  <tr><td style="background-color: LavenderBlush;">a tačan odgovor na testu</td>\
  <td style="text-align: center; color: LightBlue;"><b>&#10004</b></td></tr>\
  </table><br><br><table>';

  // poredi skupljene rezultate rešenog testa i sastavlja dinamički rezultat

  for (let i = 0; i < bp; i++) {

    let indeks_odgovora = [
      test[i].odgovor1,
      test[i].odgovor2,
      test[i].odgovor3,
      test[i].odgovor4
    ];

    
    // samo ova dva polja ulaze u html
    // a možda ih je moguće krivotvoriti u ajax pozivu iz stranice

    // sanitacija(tekst, json, char, tag, event)
    test[i].pitanje = ciscenje.sanitacija(test[i].pitanje, 1, 1, 1, 1);
    
    // broj pitanja može maksimalno biti dvocifren i ne veći od 30
    if (test[i].broj_pitanja.length > 2) {
      test[i].broj_pitanja = '30';
    }
    if (test[i].broj_pitanja > 30) {
      test[i].broj_pitanja = '30';
    }


    tabela +=
    '<tr><th>' + test[i].pitanje + '</th><td>' + test[i].broj_pitanja + '.</td></tr>';

    for (let k = 1; k < 5; k++) { // i test i rez_testa su od 1-4 (iako test ima i 0 koji se ne koristi)

      tabela += '<tr><td>' + indeks_odgovora[k-1] + '</td>';

      if (
        test[i].tacan == rez_testa[i].odabran &&
        k == rez_testa[i].odabran
      ) {
        tabela += '<td style="background-color: LightGreen; text-align: center;">&#10004</td></tr>';
        tacnih_odgovora++;
      }
      
      if (
        test[i].tacan != rez_testa[i].odabran &&
        k == rez_testa[i].odabran
      ) {
        tabela += '<td style="background-color: red; text-align: center;">&#10008</td></tr>';
      }

      if (
        test[i].tacan != rez_testa[i].odabran &&
        k == (test[i].tacan)
      ) {
        tabela += '<td style="text-align: center; color: LightBlue;"><b>&#10004</b></td></tr>';
      }

    }

    tabela += '<tr><td style="border: 0px solid white; color: white;">-</td></tr>';

  }

  let procenat_f = (tacnih_odgovora / bp) * 100;
  let procenat_r = Math.round(procenat_f);
  let ocena = Math.round((procenat_f * 5) / 100);

  tabela += '<tr><th>Tačnih odogovora: '+ tacnih_odgovora + ' od ' + bp + '. To je ' + procenat_r + '% ili ocena ' + ocena + '.</th></tr>';
 
  tabela += '</table>';

  html = tabela + '<br><p>Za drugačiji test sa istim pitanjima osvežiti stranicu (dugme F5 na tastaturi računara.)</p>';

  return html;
}


// RAND ALATI

// daje novi niz sa nasumičnim elementima iz celog niza
// menja niz koji je ubačen!!!
const array_rand2 = (niz) => {
  let novi_niz = [0];
  let i = 0;
  let izabrani_clan;
  while (niz.length > 0) {
    izabrani_clan = rndInt(0, niz.length-1);
    novi_niz[i] = niz[izabrani_clan];
    niz.splice(izabrani_clan, 1);
    i++;
  }
  return novi_niz;
}

// daje random int uključujući min i max vrednosti
function rndInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

// daje nov niz sa nasumičnim elementima iz niza tako da ih ima koliko broj_clanova
// PRAVI DUPLE I MORA DA SE SREDI PO UGLEDU NA splice MEHANIZAM ONOG GORE!!!!
function array_rand(niz, broj_clanova) {
  //console.log('niz:' + niz, 'broj:' + broj_clanova);
  //console.log(niz.length);
  let novi_niz = [0];
  for (let i = 0; i < broj_clanova; i++) {
    let clan = rndInt(0, niz.length-1);
    //console.log('clan: ' + clan);
    //console.log(niz[clan]);
    novi_niz[i] = niz[clan];
    //console.log('novi niz for:'+novi_niz);  
  }
  //console.log('novi niz out:'+novi_niz);
  return novi_niz;
}

// izmiksuje niz tako da clanovi dobiju random mesta
// ne radi nešto pa ga ne koristim u scriptu
// var arr = [2, 11, 37, 42]; shuffle(arr); console.log(arr);
function shuffle1(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

return array;
}

//lažni shuffle samo za nizove sa 10 članova
function shuffle() {
  let kombinacija = rndInt(0, 2);
  let novi_niz = [0];
  let kombinacije = [
    [4, 8, 7, 0, 2, 5, 3, 1, 9, 6],
    [6, 9, 1, 3, 5, 2, 0, 7, 8, 4],
    [2, 9, 3, 8, 6, 5, 1, 0, 4, 7]
  ];
  let izabrana = kombinacije[kombinacija];

  //for (let i = 0; i < 10; i++) {
    novi_niz = izabrana;
  //}
return novi_niz;
}


module.exports = {
  logika,
  array_rand2
}