var createConnection = require('../models/baza');
var ciscenje = require('../models/ciscenje');
var alati = require('../controllers/ajaxController');



// ****************************************************************
// prikazuje radio izbor za predmete i sva pitanja iz baze
// ****************************************************************
const pitanja_get = (req, res) => {

  // let upis = req.body;
  // console.log(upis);

  createConnection(function(err, connection) {
    if (err) {
      //console.log('greška: ' + err);
      throw err;
    }

    let ct_result_zasve = '';
    let ct_predmeti = '';

    // qery za spisak svih testova
    connection.query(
      'SELECT * FROM g_pitanja_c_testovi WHERE tip = "c_test";',
      function (err, results, fields) {
        if (err) throw err;
        //console.log(results);
        //res.render('c_test/c_tests', { c_tests: results, title: 'Testovi'});
        ct_result_zasve = results;
      }
    );

    // query za izdvojeni spisak predmeta za testove
    connection.query(
      'SELECT DISTINCT predmet FROM g_pitanja_c_testovi WHERE tip = "c_test";',
      function (err, results, fields) {
        if (err) throw err;
        //console.log(result);
        //console.log(rt);

        ct_predmeti = results;

        // res.render('c_test/c_tests', {
        //   d_predmeti: results,
        //   c_tests: ct_result_zasve,
        //   title: 'Testovi'
        // });

      }
    );

    let p_result_zasve = '';

    // qery za spisak svih pitanja
    connection.query(
      'SELECT * FROM g_pitanja_c_testovi WHERE tip = "pitanja";',
      function (err, results, fields) {
        if (err) throw err;
        //console.log(results);
        //res.render('pitanja/pitanja', { pitanja: result, title: 'Pitanja'});
        p_result_zasve = results;
      }
    );

    // query za izdvojeni spisak predmeta za pitanja
    connection.query(
      'SELECT DISTINCT predmet FROM g_pitanja_c_testovi WHERE tip = "pitanja";',
      function (err, results, fields) {
        if (err) throw err;
        //console.log(result);
        //console.log(rt);

        res.render('pitanja/pitanja', {
          p_predmeti: results,
          ct_predmeti: ct_predmeti,
          testovi: ct_result_zasve,
          pitanja: p_result_zasve,
          title: 'Pitanja'});

      }
    );

    connection.release();
  });

}



// ****************************************************************
// prikazuje prvo smer i razred
// zatim oblasti
// zatim spisak pitanja
// sva tri na osnovu izbora iz radio button
// ****************************************************************
const pitanja_post = (req, res) => {

  let iz_pitanja = req.body;
  //console.log('req.body iz_pitanja: ', iz_pitanja);
  //console.log('req: ', req);
  let iz_pitanja_p = '';
  let iz_pitanja_op = '';
  let iz_pitanja_r = '';
  let iz_pitanja_tip = '';

  createConnection(function(err, connection) {
    if (err) {
      //console.log('greška: ' + err);
      throw err;
    }

    for (const property in iz_pitanja) {

      if (property.includes('radio1')) { //obrada za izabrani predmet

        //pakovanje u 1d niz
        let niz_iz_pitanja = iz_pitanja.radio1.split("|");

        //console.log('iz_pitanja_p:', iz_pitanja, niz_iz_pitanja);

        // validacija = (tekst, trim, upper_case, len, semicolon)
        for (const e in niz_iz_pitanja) {
          niz_iz_pitanja[e] = ciscenje.validacija(niz_iz_pitanja[e], 1, 0, 0, 1);
        }
        
        iz_pitanja_p = niz_iz_pitanja[0]; // predmet
        iz_pitanja_tip = niz_iz_pitanja[1]; // tip

        // validacija = (tekst, trim, upper_case, len, semicolon)
        //iz_pitanja_p = ciscenje.validacija(iz_pitanja_p, 1, 0, 0, 1);

        // pripremljeni podaci nakon validacije unosa moraju da budu u formi niza
        let sql_prepared_data = [];

        // sql pripremljen upit
        let sql_prepared_statement = 'SELECT DISTINCT obrazovni_profil, razred \
        FROM g_pitanja_c_testovi \
        WHERE predmet = ? AND tip = ?\
        ORDER BY predmet;';

        // pripremljeni podaci
        sql_prepared_data = [iz_pitanja_p, iz_pitanja_tip];

        //console.log('\nsql upit pre execute u bazu:\n' + sql_prepared_statement);
        //console.log('\ndata niz (' + sql_prepared_data.length + ') pre execute u bazu:\n' + sql_prepared_data);

        connection.execute(
          sql_prepared_statement,
          sql_prepared_data,
          function(err, results, fields) {
            if (err) throw err;
            //console.log(results); // results contains rows returned by server
            // console.log(fields); // fields contains extra meta data about results, if available
            // If you execute same statement again, it will be picked from a LRU cache
            // which will save query preparation time and give better performance
            res.render('pitanja/iz_pitanja1', {
              predmeti_op_r: results,
              putnik1: iz_pitanja.radio1, // predmet i tip se šalju dalje u kompletu
              title: iz_pitanja_p
            });
          }
        );

        // verzija bez prepared statements
        //
        // connection.query (
        //   'SELECT DISTINCT obrazovni_profil, razred \
        //   FROM g_pitanja_270122 \
        //   WHERE predmet = "' + iz_pitanja_p + '";',
          
        //   function (err, result, fields) {
        //     if (err) throw err;
        //     //console.log('result nakon iz_pitanja_p: ', result);
        //     res.render('pitanja/iz_pitanja1', {
        //       predmeti_sr: result,
        //       putnik1: iz_pitanja_p,
        //       title: iz_pitanja_p
        //     });
        //   }
        // );

        break;

      } else if (property.includes('radio2')) { // obrada za izabrani obrazovni profil i razred (predmet i tip se prenose sa prethodne strane)

        //pakovanje u 1d niz
        let niz_iz_pitanja = iz_pitanja.radio2.split("|");

        //console.log(niz_iz_pitanja)

        // validacija = (tekst, trim, upper_case, len, semicolon)
        for (const e in niz_iz_pitanja) {
          niz_iz_pitanja[e] = ciscenje.validacija(niz_iz_pitanja[e], 1, 0, 0, 1);
        }
        
        iz_pitanja_op = niz_iz_pitanja[0]; // obrazovni profil
        iz_pitanja_r = niz_iz_pitanja[1]; // razred
        iz_pitanja_p = niz_iz_pitanja[2]; // predmet
        iz_pitanja_tip = niz_iz_pitanja[3]; // tip

        //pravljenje naslova za sledeću stranu
        let h4_oprp = iz_pitanja_op + ', ' + iz_pitanja_r + ', ' + iz_pitanja_p;

        // pripremljeni podaci nakon validacije unosa moraju da budu u formi niza
        let sql_prepared_data = [];

        // sql pripremljen upit
        let sql_prepared_statement = 'SELECT DISTINCT oblast \
          FROM g_pitanja_c_testovi \
          WHERE obrazovni_profil = ? AND razred = ? AND predmet = ? AND tip = ? \
          ORDER BY oblast;';

        // pripremljeni podaci
        sql_prepared_data = [
          iz_pitanja_op,
          iz_pitanja_r,
          iz_pitanja_p,
          iz_pitanja_tip
        ];

        //console.log('\nsql upit pre execute u bazu:\n' + sql_prepared_statement);
        //console.log('\ndata niz (' + sql_prepared_data.length + ') pre execute u bazu:\n' + sql_prepared_data);

        connection.execute(
          sql_prepared_statement,
          sql_prepared_data,
          function(err, results, fields) {
            if (err) throw err;

            //console.log(results)
            
            res.render('pitanja/iz_pitanja2', {
              predmeti_opr_o: results,
              h4_oprp: h4_oprp,
              putnik2: iz_pitanja.radio2, // o.profil, razred, predmet i tip se šalju dalje
              title: 'Pitanja'
            });

          }
        );

        break;

      } else if (property.includes('check3')) { // izbor za oblast/i i lekciju/e

        let niz_iz_pitanja = []; // biće 1d ili 2d niz

        //console.log(iz_pitanja)

        let podnaslovi = [];
        let h4_oprp = '';

        let jedan_string = false;

        let sql_prepared_statement = '';
        let sql_prepared_data = [];
        let sqlx = ' ORDER BY g_id;';

        // iz_pitanja daje length za broj stringova ako ih ima ali ako ih nema onda daje
        // dužinu tog jednog stringa kojeg ima što čini haos sa ispitivanjem i pravljenjem
        // ostalih nizova, zato mora prvo to da se ispita
        // iz istog ovog razloga prave se komplikacije i za stranu iz_pitanja3.ejs koja lista podnaslove i pitanja

        try {
          if (typeof iz_pitanja.check3[1][1] == 'undefined') {
            // console.log('undef check11: ', iz_pitanja.check3[1][1]);
            // console.log('undef check01: ', iz_pitanja.check3[0][1]);
            jedan_string = true;
          } else {
            // console.log('def check11: ', iz_pitanja.check3[1][1]);
            // console.log('def check01: ', iz_pitanja.check3[0][1]);
            jedan_string = false;
          }
        } catch {
          console.log('catch');
          jedan_string = true;
        }

        //console.log('jedan string: ' + jedan_string);
        //console.log('11: ', iz_pitanja[1][1]);

        if (jedan_string) { //ima samo jedan string

          // pakovanje u 1d niz
          niz_iz_pitanja = iz_pitanja.check3.split("|");
          //console.log(niz_iz_pitanja)

          // validacija = (tekst, trim, upper_case, len, semicolon)
          for (const e in niz_iz_pitanja) {
            niz_iz_pitanja[e] = ciscenje.validacija(niz_iz_pitanja[e], 1, 0, 0, 1);
          }

          sql_prepared_statement =
            'SELECT * \
            FROM g_pitanja_c_testovi \
            WHERE \
            obrazovni_profil = ? AND razred = ? AND predmet = ? AND tip = ? AND oblast = ?';

          sql_prepared_data = [
            niz_iz_pitanja[1], // obrazovni profil
            niz_iz_pitanja[2], // razred
            niz_iz_pitanja[3], // predmet
            niz_iz_pitanja[4], // tip
            niz_iz_pitanja[0], // oblast
          ];

        } else { // ima više stringova

          //console.log('IMA VIŠE STRINGOVA U PODACIMA IZ PITANJA2');

          for (let i = 0; i < iz_pitanja.check3.length; i++) {

            //pakovanje u 2d niz
            niz_iz_pitanja[i] = iz_pitanja.check3[i].split("|");

            // validacija = (tekst, trim, upper_case, len, semicolon)
            for (const e in niz_iz_pitanja[i]) {
              niz_iz_pitanja[i][e] = ciscenje.validacija(niz_iz_pitanja[i][e], 1, 0, 0, 1);
            }
  
            // pravljenje višetrukog query sa UNION SELECT

            if (niz_iz_pitanja.length == 1) { // kada, u početku for petlje, 2d niz ima samo 1 člana onda se uzima početak sql upita

              sql_prepared_statement =
              'SELECT * \
              FROM g_pitanja_c_testovi \
              WHERE \
              obrazovni_profil = ? AND razred = ? AND predmet = ? AND tip = ? AND oblast = ?';

              sql_prepared_data = [
                niz_iz_pitanja[i][1],
                niz_iz_pitanja[i][2],
                niz_iz_pitanja[i][3],
                niz_iz_pitanja[i][4],
                niz_iz_pitanja[i][0]
              ];

            } else { // kada, u nastavku for petlje, 2d niz ima više članova onda se dodaje union

              sql_prepared_statement +=
              ' UNION ALL \
              SELECT * \
              FROM g_pitanja_c_testovi \
              WHERE \
              obrazovni_profil = ? AND razred = ? AND predmet = ? AND tip = ? AND oblast = ?';
              // SELECT column_name(s) FROM table1
              // UNION ALL
              // SELECT column_name(s) FROM table2;

              sql_prepared_data.push(
                niz_iz_pitanja[i][1],
                niz_iz_pitanja[i][2],
                niz_iz_pitanja[i][3],
                niz_iz_pitanja[i][4],
                niz_iz_pitanja[i][0]
              );

            }
          }

        }

        sql_prepared_statement += sqlx; //dodaje se sortiranje i završetak

        connection.execute(
          sql_prepared_statement,
          sql_prepared_data,
          function(err, results, fields) {
            if (err) throw err;

            //console.log('results: ', results);
            //console.log('results length: ', results.length);

            // izgleda da ejs ili browser escapuje automatski ' " i <> sa brojčanim html kodovima:
            // &#39; &#34; &lt; &gt;
            // i to radi čak i kada dobije &apos; &quot; za ' i "
            //
            //sanitacija
            //console.log('sanitacija')
            let tekst = '';
            results.forEach(element => {
              for (let property in element) {
                if (element[property] !== null) {
                  tekst = element[property].toString();
                  // sanitacija(tekst, json, char, tag, event)
                  tekst = ciscenje.sanitacija(tekst, 1, 1, 1, 1);
                  element[property] = tekst;
                }
              }
            });

            // results sada daje niz sa jednim objektom tj. jedan red iz baze
            // i mora iz toga da se izvadi niz pitanja i odgovora

            let results_niz = [];
            p = 1; //broj proverenih pitanja u for petlji
            index = 0; //indeks niza

            results.forEach(element => {
              for (const property in element) {
                if (property.includes('pitanje_')) {
                  if (element['pitanje_'+p] != '') {
                    let obj = {};
                    obj[property] = element[property];
                    if (element['odg_'+p+'_1'] != '') {
                      obj['odg_'+p+'_1'] = element['odg_'+p+'_1'];
                    }
                    results_niz[index] = obj;
                    index++;
                    p++;
                  }
                }
              }
              p = 1;
            });

            //console.log(index, results_niz.length)

            // pravljenje naslova za sledeću stranu
            // iako je dvodimenzionalni niz u svim pod nizovima su ista polja za smer, razred i predmet
            h4_oprp = results[0]['obrazovni_profil'] + ', ' + results[0]['razred'] +
            ', ' + results[0]['predmet'];

            // građenje višestrukog podnaslova za novu stranu iako ima samo jedan niz
            // to je neophodno da se ne bi gradila komplikovana procedura u strani iz_pitanja3.ejs
            // da bi se ona snalazila i sa 1d i sa 2d nizovima
            for (let i = 0; i < results.length; i++) {
              podnaslovi[i] = [results[i]['g_id'], results[i]['oblast'], results[i]['link1'], results[i]['link2'], results[i]['link3']];
            }

            // mora sa concat jer se znakom = samo prenose pointeri originalnog niza koji se onda menja
            // narednim operacijama a concat spaja nizove formiranjem novog a original ne dira
            let pitanja_rnd_tmp = [];
            pitanja_rnd_tmp = results_niz.concat(pitanja_rnd_tmp);
            //ceo niz sa pitanjima se meša i menja se i originalni niz koji je ubačen:
            let pitanja_rnd = alati.array_rand2(pitanja_rnd_tmp);

            let {auto_test_html_form, auto_test_niz, auto_test_bp} = auto_test(pitanja_rnd);

            // ako je tip pitanja onda ide na iz_pitanja3 a ako nije onda na c_tests3
            let ruta = 'pitanja/iz_pitanja3';

            if (results[0]['tip'] == 'pitanja') {
              ruta = 'pitanja/iz_pitanja3';
            } else if (results[0]['tip'] == 'c_test') {
              ruta = 'c_test/c_tests3';
            }

            res.render(ruta, {
              predmeti_sr_ol_5: results_niz,
              c_tests: results,
              auto_test_html_form: auto_test_html_form,
              auto_test_niz: auto_test_niz,
              auto_test_bp: auto_test_bp,
              h4_oprp: h4_oprp,
              podnaslovi: podnaslovi,
              title: 'Pitanja'
            });

          }
        );

        break;

      } else {
        console.log('neki property iz forma ili neki radio nije prošao');
        // res.setHeader('Content-type', 'text/html; charset=utf-8');
        // res.statusCode = 200;
        // res.write("Nešto nije u redu. Probajte ponovo ili prijavite problem preko mejla na kontakt strani.");
        // res.end();
        res.redirect('404');
      }

    }

    connection.release();
  });

}


// od niza pitanja automatski pravi test
function auto_test(pitanja_rnd) {

  //let pitanja_test = array_rand2(pitanja);
  //let pitanja_test = pitanja_rnd;

  let pitanja_test = [];
  index = 0; //indeks niza

  // promenljive koje su bile u scriptu
  bp = pitanja_rnd.length; // broj pitanja
  let test = [];

  //formatizovanje niza sa pitanjima u niz pogodan za test
  //po ugledu na niz koji daje kod u c_test iz baze podataka za c_test-ove
  pitanja_rnd.forEach(element => {
    let obj = {};
    for (const property in element) {
      if (property.includes('pitanje_')) {
        obj['pitanje'] = element[property];
      }
      if (property.includes('odg_')) {
        obj['odgovor'] = element[property];
      }
      pitanja_test[index] = obj;
    }
    index++;
  });

  //console.log(pitanja_test)
  //let test = [];
  let odgovor = [];
  let html = '<p>Ukoliko za neka pitanja nije upisan nikakav odgovor auto-test će to označiti. Takođe je automatski označen prvi odgovor na svako pitanje a korisnik bi svakako trebalo da odabere onaj odgovor koji smatra za tačan. Testovi sa manje od 10 pitanja mogu da dovedu do ponavljanja odgovora u pitanjima i nepredvidljivih rezultata u obradi tačnosti testa.</p><br>';
  
  let tabela= '<table>';

  // onSubmit="return validate_input(this)
  
  // bp je broj pitanja
  bpi = bp - 1; // index zadnjeg člana niza je za jedan manji od broja članova jer ide od 0

  // ako nije upisan odgovor ili je polje nedefinisano upisuje se da ga nema
  for (let i = 0; i < bp; i++) {
    if (pitanja_test[i].odgovor == '') {
      pitanja_test[i].odgovor = 'Nema upisanog odgovora.';
    }
    if (typeof pitanja_test[i].odgovor == 'undefined') {
      pitanja_test[i].odgovor = 'Nema upisanog odgovora';
    }
  }


  // generator testa

  for (let i = 0; i < bp; i++) {

    // određivanje tri druga odgovora različitih od tačnog

    let rnd1 = rndInt(0, bpi);
    let rnd2 = rndInt(0, bpi);
    let rnd3 = rndInt(0, bpi);
    let rnd4 = rndInt(0, bpi);

    //console.log('rnd ', bp, i, rnd1, rnd2, rnd3, rnd4);

    odgovor[1] = pitanja_test[rnd1].odgovor;
    odgovor[2] = pitanja_test[rnd2].odgovor;
    odgovor[3] = pitanja_test[rnd3].odgovor;
    odgovor[4] = pitanja_test[rnd4].odgovor;
    let tacan = pitanja_test[i].odgovor;

    //console.log('odg1 ', bp, i, rnd1, rnd2, rnd3, rnd4);

    // provera da li su isti sa pravim odgovorom i još par pokušaja da neki ne bude isti kao tačan

    if ( odgovor[1] == tacan ) { rnd1 = rndInt(0, bpi); odgovor[1] = pitanja_test[rnd1].odgovor;}
    if ( odgovor[2] == tacan ) { rnd2 = rndInt(0, bpi); odgovor[2] = pitanja_test[rnd2].odgovor;}
    if ( odgovor[3] == tacan ) { rnd3 = rndInt(0, bpi); odgovor[3] = pitanja_test[rnd3].odgovor;}
    if ( odgovor[4] == tacan ) { rnd4 = rndInt(0, bpi); odgovor[4] = pitanja_test[rnd4].odgovor;}

    if ( odgovor[1] == tacan ) { rnd1 = rndInt(0, bpi); odgovor[1] = pitanja_test[rnd1].odgovor;}
    if ( odgovor[2] == tacan ) { rnd2 = rndInt(0, bpi); odgovor[2] = pitanja_test[rnd2].odgovor;}
    if ( odgovor[3] == tacan ) { rnd3 = rndInt(0, bpi); odgovor[3] = pitanja_test[rnd3].odgovor;}
    if ( odgovor[4] == tacan ) { rnd4 = rndInt(0, bpi); odgovor[4] = pitanja_test[rnd4].odgovor;}

    if ( odgovor[1] == tacan ) { rnd1 = rndInt(0, bpi); odgovor[1] = pitanja_test[rnd1].odgovor;}
    if ( odgovor[2] == tacan ) { rnd2 = rndInt(0, bpi); odgovor[2] = pitanja_test[rnd2].odgovor;}
    if ( odgovor[3] == tacan ) { rnd3 = rndInt(0, bpi); odgovor[3] = pitanja_test[rnd3].odgovor;}
    if ( odgovor[4] == tacan ) { rnd4 = rndInt(0, bpi); odgovor[4] = pitanja_test[rnd4].odgovor;}

    //console.log('odg2 ', bp, i, rnd1, rnd2, rnd3, rnd4);

    // određivanje pozicije tačnog

    index_tacnog = rndInt(1, 4); // namerno ostavljam 0 index prazan
    odgovor[index_tacnog] = tacan;

    // tačan se ubacuje na mesto onog na čiju je poziciju odabran a taj se izbacuje
    
    odgovor.splice(index_tacnog, 1, tacan);

    // punjenje test niza

    test[i] = {
      pitanje: pitanja_test[i].pitanje,
      odgovor1: odgovor[1],
      odgovor2: odgovor[2],
      odgovor3: odgovor[3],
      odgovor4: odgovor[4],
      tacan: index_tacnog,
      broj_pitanja: i+1,
    };

    // pravi redove u tabeli za svako pitanje

    tabela +=
    '<tr><th>' + test[i].pitanje + '</th><td>' + test[i].broj_pitanja + '.</td></tr>' +

    '<tr><td>' + test[i].odgovor1 + '</td><td>' +
    '<input type="radio"\
      id="' + test[i].broj_pitanja + '|' + 1 + '"\
      name="' + test[i].broj_pitanja + '"\
      value="' + 1 + '"\
      checked>' +
    '</td></tr>' +

    '<tr><td>' + test[i].odgovor2 + '</td><td>' +
    '<input type="radio"\
      id="' + test[i].broj_pitanja + '|' + 2 + '"\
      name="' + test[i].broj_pitanja + '"\
      value="' + 2 + '"\
      >' +
    '</td></tr>' +

    '<tr><td>' + test[i].odgovor3 + '</td><td>' +
    '<input type="radio"\
      id="' + test[i].broj_pitanja + '|' + 3 + '"\
      name="' + test[i].broj_pitanja + '"\
      value="' + 3 + '"\
      >' +
    '</td></tr>' +

    '<tr><td>' + test[i].odgovor4 + '</td><td>' +
    '<input type="radio"\
      id="' + test[i].broj_pitanja + '|' + 4 + '"\
      name="' + test[i].broj_pitanja + '"\
      value="' + 4 + '"\
      >' +
    '</td></tr>' +
    
    '<tr><td style="border: 0px solid white; color: white;">-</td></tr>';

  }

  tabela +=
  '<tr>\
    <td style="border: 0px solid white; color: white;"></td>\
    <td style="border: 0px solid white; color: white;"></td>\
    <td style="text-align: right; padding-top: 5px; border: 0px solid white;">\
      <button id="resenje_testa" onclick="pregled_testa()">Pošalji test na proveru</button>\
    </td>\
  </tr>';

  tabela += '</table><br><br>';

  html = html + tabela;

  // izbacuje html test i korisnik ga rešava

  //document.getElementById("t_auto_test").innerHTML = html;

  //return html;

  return {
    auto_test_html_form: html,
    auto_test_niz: test,
    auto_test_bp: bp
  }
  
}


// daje random int uključujući min i max vrednosti
function rndInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}



// ****************************************************************
// izbacuje form za upis novih pitanja
// ****************************************************************
const pitanja_create_get = (req, res) => {
  res.render('pitanja/create', { title: 'Nova pitanja' });
}



// ****************************************************************
// upisuje nova pitanja u bazu
// ****************************************************************
const pitanja_create_post = (req, res) => {

  // detaljni i opširni komentari za ovdašnji kod su u
  // bekap verzijama pitanjaControllers jer je kod sličan

  let upis = req.body;
  //console.log(req);
  //console.log('pitanja kontroler');

  let sql_prepared_data = [];
  let sql_prepared_data_1 = [];
  let sql_prepared_data_2 = [];

  let sql_prepared_statement = '';

  let sql1a = '';
  let sql1b = '';
  let sql1c = '';

  let sql2a = '';
  let sql2b = '';

  let sqlx = 'end);'; //završni deo sql upita

  // let datum = new Date;

  // za user_id PROMENITI kako valja KADA SE URADI AUTENTIKACIJA
  let tip = 'pitanja';
  let user_id = "1";
  let host_path = req.rawHeaders[33];

  //req.rawHeaders[33]: 'http://localhost:3000/c_test/create'
  //baseUrl: '/c_test',
  //originalUrl: '/c_test/create',
  
  let from_req = {
    tip: tip,
    user_id: user_id,
    host_path: host_path
  }

  createConnection(function(err, con) {

    if (err) {
      //console.log('greška: ' + err);
      throw err;
    }

    // VALIDACIJA unosa u bazu:
    // trim: trimuje space - 0/1
    // upper_case: stavlja velika početna slova - 0/1
    // len: skraćuje tekst na zadatu dužinu - 0-n
    // semicolon: escapuje ; sa \; - 0/1
    //
    // validacija = (tekst, trim, upper_case, len, semicolon)

    // za ova dva ne treba uppercase
    from_req.user_id = ciscenje.validacija(from_req.user_id, 1, 0, 11, 1);
    from_req.host_path = ciscenje.validacija(from_req.host_path, 1, 0, 45, 1);

    from_req.tip = ciscenje.validacija(from_req.tip, 1, 0, 10, 1);

    upis.obrazovni_profil = ciscenje.validacija(upis.obrazovni_profil, 1, 1, 100, 1);
    upis.predmet = ciscenje.validacija(upis.predmet, 1, 1, 100, 1);
    upis.oblast = ciscenje.validacija(upis.oblast, 1, 1, 100, 1);
    upis.link1 = ciscenje.validacija(upis.link1, 1, 0, 300, 1);
    upis.link2 = ciscenje.validacija(upis.link2, 1, 0, 300, 1);
    upis.link3 = ciscenje.validacija(upis.link3, 1, 0, 300, 1);
    
    p = 1; //broj proverenih pitanja u for petlji
    for (const property in upis) {
      if (property.includes('pitanje_')) {
        if (upis['pitanje_'+p] !== '') {
          upis['pitanje_'+p] = ciscenje.validacija(upis['pitanje_'+p], 1, 1, 400, 1);
          upis['odg_'+p+'_1'] = ciscenje.validacija(upis['odg_'+p+'_1'], 1, 1, 300, 1);
        }
        p++;
      }
    }

    if (upis.razred.length > 1) {
      upis.razred = '8';
    }

    if (upis.razred > 8) {
      upis.razred = '8';
    }
    

    // PREPARED STATEMENTS

    // prvi fiksni deo sql upita
    sql1a = 'INSERT INTO g_pitanja_c_testovi (tip, obrazovni_profil, razred, predmet, oblast, link1, link2, link3, user_id, from_url, ';

    // iz petlje: sql1b = pitanje_1, odgovor_1_1 _2 _3 _4, r_1 ... ... ...

    sql1c = 'end) VALUES (';
    

    // sklapanje prve polovine drugog dela sql pripremljenog upita
    sql2a =
      '?, ' + //upis.tip
      '?, ' + //upis.obrazovni_profil
      '?, ' + //upis.razred
      '?, ' + //upis.predmet
      '?, ' + //upis.oblast
      '?, ' + //upis.link1
      '?, ' + //upis.link2
      '?, ' + //upis.link3
      '?, ' + //from_req.user_id
      '?, ';  //from_req.from_url


    // pravi se u petlji: sql2b = ??? ??? ??? ... ... ...

    // sklapanje prve polovine sql pripremljenih podataka nakon sanitacije unosa
    sql_prepared_data_1 = [
      from_req.tip,
      upis.obrazovni_profil,
      upis.razred,
      upis.predmet,
      upis.oblast,
      upis.link1,
      upis.link2,
      upis.link3,
      from_req.user_id,
      from_req.host_path
    ];

    // sklapanje druge polovine drugog dela sql upita nakon sanitacije unosa:
    //
    // ako je upisano prvo pitanje koje je obavezno
    // uzimaju se elementi objekta tj. property
    // proverava se da li u nazivu imaju 'pitanje' zatim
    // ako element pitanje+i ima upis onda se pravi njegov deo sql upita
    //
    if (upis.pitanje1 !== '') {
      let i = 1; //broj proverenih pitanja
      sql1b = '';
      sql2b = '';

      for (const property in upis) {
        //console.log('i: ' + i);
        if (property.includes('pitanje_')) {
          //console.log('pitanje '+ i + ': ' + upis['pitanje_'+i]);
          if (upis['pitanje_'+i] !== '') {

            // sklapanje druge polovine prvog dela sql pripremljenog upita
            sql1b +=
            'pitanje_'+ i +
            ', odg_' + i +
            '_1, ';

            // sklapanje druge polovine drugog dela sql pripremljenog upita
            sql2b +=
            '?, ' + //upis['pitanje_' + i]
            '?, ';  //upis['odg_' + i + '_1']
            //console.log('sql2b: ', sql2b);

            // popunjavanje druge polovine sql pripremljenih podataka
            sql_prepared_data_2.push(
              upis['pitanje_' + i],
              upis['odg_' + i + '_1']
            )

          }
          i++;
        }
      }
    }

    // pakovanje celog sql
    sql_prepared_statement = sql1a + sql1b + sql1c + sql2a + sql2b + sqlx;

    // čišćenje od nepotrebnih zareza na krajevima uz pomoć end umetnutog završetka
    sql_prepared_statement = sql_prepared_statement.replace(/, end/g, "");

    sql_prepared_data = sql_prepared_data.concat(sql_prepared_data_1);
    sql_prepared_data = sql_prepared_data.concat(sql_prepared_data_2);
    
    // console.log('\nsql upit pre execute u bazu:\n', sql_prepared_statement);
    // console.log('\ndata niz (' + sql_prepared_data.length + ') pre execute u bazu:\n', sql_prepared_data);

    con.execute(
      sql_prepared_statement,
      sql_prepared_data,
      function(err, results, fields) {
        if (err) throw err;
        // console.log(results); // results contains rows returned by server
        // console.log(fields); // fields contains extra meta data about results, if available
        // If you execute same statement again, it will be picked from a LRU cache
        // which will save query preparation time and give better performance
      }
    );

    sql_prepared_statement = '';
    sql1a = '';
    sql1b = '';
    sql1c = '';
    sql2a = '';
    sql2b = '';

    sql_prepared_data = [];
    sql_prepared_data_1 = [];
    sql_prepared_data_2 = [];

    con.release();
    res.redirect('/pitanja/pitanja');

  });

}



module.exports = {
  pitanja_get,
  pitanja_post,

  pitanja_create_get,
  pitanja_create_post
}