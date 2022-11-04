var createConnection = require('../models/baza');
var ciscenje = require('../models/ciscenje');


// ****************************************************************
// prikazuje korisničke testove iz baze i radio izbor za predmete
// ****************************************************************
const c_tests_get = (req, res) => {

  // let upis = req.body;
  // console.log(upis);

  createConnection(function(err, connection) {
    if (err) {
      //console.log('greška: ' + err);
      throw err;
    }

    let result_zasve = '';

    // qery za spisak svih testova
    connection.query(
      'SELECT * FROM g_pitanja_c_testovi WHERE tip = "c_test";',
      function (err, results, fields) {
        if (err) throw err;
        //console.log(results);
        //res.render('c_test/c_tests', { c_tests: results, title: 'Testovi'});
        result_zasve = results;
      }
    );

    // query za izdvojeni spisak predmeta koji postoje kada bude više testova
    connection.query(
      'SELECT DISTINCT predmet FROM g_pitanja_c_testovi WHERE tip = "c_test";',
      function (err, results, fields) {
        if (err) throw err;
        //console.log(result);
        //console.log(rt);

        res.render('c_test/c_tests', {
          d_predmeti: results,
          c_tests: result_zasve,
          title: 'Testovi'
        });

      }
    );

    connection.release();
  });

}



// ****************************************************************
// prikazuje test iz baze na osnovu odabranog linka u c_tests
// ****************************************************************
const c_test_get = (req, res) => {

  /*
  search: '?id=7',
  query: 'id=7',
  pathname: '/c_test/c_test',
  path: '/c_test/c_test?id=7',
  href: '/c_test/c_test?id=7',
  _raw: '/c_test/c_test?id=7'
  url: '/c_test?id=4',
  */
  //query: { id: '4' },

  let test_id = req.query.id;
  //console.log(test_id);


  createConnection(function(err, connection) {
    if (err) {
      //console.log('greška: ' + err);
      throw err;
    }

    // validacija(tekst, trim, upper_case, len, semicolon)
    // ne prihvata id veći od 5-cifrenog broja a time ni bilo šta od dužih tekstova i komandi
    test_id = ciscenje.validacija(test_id, 1, 0, 5, 1);

    // pripremljeni podaci nakon sanitacije unosa moraju da budu u formi niza
    let sql_prepared_data = [];

    // sql pripremljen upit
    let sql_prepared_statement = 'SELECT * \
    FROM g_pitanja_c_testovi \
    WHERE g_id = ?;';

    // pripremljeni podaci
    sql_prepared_data = [test_id];

    connection.execute(
      sql_prepared_statement,
      sql_prepared_data,
      function(err, results, fields) {
        if (err) throw err;

        //console.log(results); //results je niz js objekata

        let tekst = '';

        results.forEach(element => {
          for (let property in element) {
            if (element[property] !== null) {
              tekst = element[property].toString();
              //sanitacija(tekst, json, char, tag, event)
              tekst = ciscenje.sanitacija(tekst, 1, 1, 1, 1);
              element[property] = tekst;
            }
          }
        });

        // pravljenje naslova za sledeću stranu
        h4_oprp = results[0]['obrazovni_profil'] + ', ' + results[0]['razred'] +
        ', ' + results[0]['predmet'];

        // građenje višestrukog podnaslova za novu stranu iako ima samo jedan niz
        // to je neophodno da se ne bi gradila komplikovana procedura u strani iz_pitanja3.ejs
        // da bi se ona snalazila i sa 1d i sa 2d nizovima
        let podnaslovi = [];
        podnaslovi[0] = [results[0]['g_id'], results[0]['oblast'], results[0]['link1'], results[0]['link2'], results[0]['link3']];

        // results se pakuju u format niza sa pitanjima i odgovorima kao što ima auto_test
        let {c_test_html_form, c_test_niz} = c_test_pak(results);

        res.render('c_test/c_test', {
          c_test_niz: c_test_niz,
          c_test_html_form: c_test_html_form,
          //pitanja: results,
          h4_oprp: h4_oprp,
          podnaslovi: podnaslovi,
          title: 'Test',          
        });

      }
    );

    connection.release();
  });

}



// priprema html za prikaz odabranog testa
function c_test_pak (c_test) {

  let test = [];

  let p = 1; //broj proverenih pitanja u for petlji
  for (const property in c_test[0]) {
    if (property.includes('pitanje_')) {
      if (
        c_test[0]['pitanje_'+p] == '' ||
        c_test[0]['pitanje_'+p] == null
        ) {
          
      } else {

        test.push(
          {
          pitanje: c_test[0]['pitanje_' + p],
          odgovor1: c_test[0]['odg_' + p + '_1'],
          odgovor2: c_test[0]['odg_' + p + '_2'],
          odgovor3: c_test[0]['odg_' + p + '_3'],
          odgovor4:c_test[0]['odg_' + p + '_4'],
          tacan: c_test[0]['r_' + p],
          broj_pitanja: p
          }
        );

      }
      p++;
    }
  }

  let bp = test.length; //broj pitanja

  let html = '<p>Ukoliko za neka pitanja nije upisan nikakav tekst u bazi podataka sistem će to preskočiti. Takođe je automatski označen prvi odgovor na svako pitanje a korisnik bi svakako trebalo da odabere onaj odgovor koji smatra za tačan.</p><br>';
    
  let tabela = '<table>';

  // generator tabele

  for (let i = 0; i < bp; i++) {

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

  return {
    c_test_html_form: html,
    c_test_niz: test,
  }

}



// modifikovati za c_test kada bude više testova
//
// ****************************************************************
// prikazuje prvo smer i razred
// zatim oblast i lekcije
// zatim spisak pitanja
// na osnovu izbora iz radio button
// ****************************************************************
//
// modifikovati za c_test kada bude više testova
const pitanja_post = (req, res) => {

  let iz_pitanja = req.body;
  console.log('req.body iz_pitanja: ', iz_pitanja);
  let iz_pitanja_p = '';
  let iz_pitanja_op = '';
  let iz_pitanja_r = '';
  let t1 = '';

  createConnection(function(err, connection) {
    if (err) {
      //console.log('greška: ' + err);
      throw err;
    }

    for (const property in iz_pitanja) {

      if (property.includes('radio1')) { //izbor predmeta

        iz_pitanja_p = iz_pitanja.radio1;
        //console.log('iz_pitanja_p:',iz_pitanja_p);

        // escaping i sanitacija

        // for petlja je ostavljena za slučaj da bude više unosa
        //
        //for (const e in from_req) {
          iz_pitanja_p = iz_pitanja_p.replace(/"/g, "\\\"");
          iz_pitanja_p = iz_pitanja_p.replace(/'/g, "\\\'");
          iz_pitanja_p = iz_pitanja_p.replace(/;/g, "\\;");
          iz_pitanja_p = iz_pitanja_p.replace(/&/g, "\\&");
          iz_pitanja_p = iz_pitanja_p.replace(/=/g, "\\=");
          iz_pitanja_p = iz_pitanja_p.replace(/</g, "&lt;");
          iz_pitanja_p = iz_pitanja_p.replace(/>/g, "&gt;");
          iz_pitanja_p = iz_pitanja_p.replace(/\.js/g, "\\.js"); //ubačeno \ jer bez njega regex uništi reči kao što su hemijska
        //}


        // prepared statements

        // pripremljeni podaci nakon sanitacije unosa moraju da budu u formi niza
        let sql_prepared_data = [];

        // sql pripremljen upit
        let sql_prepared_statement = 'SELECT DISTINCT obrazovni_profil, razred \
        FROM temp_pitanja \
        WHERE predmet = ? \
        ORDER BY predmet;';

        // pripremljeni podaci
        sql_prepared_data = [iz_pitanja_p];

        //console.log('\nsql upit pre execute u bazu:\n' + sql_prepared_statement);
        //console.log('\ndata niz (' + sql_prepared_data.length + ') pre execute u bazu:\n' + sql_prepared_data);

        connection.execute(
          sql_prepared_statement,
          sql_prepared_data,
          function(err, results, fields) {
            if (err) throw err;
            // console.log(results); // results contains rows returned by server
            // console.log(fields); // fields contains extra meta data about results, if available
            // If you execute same statement again, it will be picked from a LRU cache
            // which will save query preparation time and give better performance
            res.render('pitanja/iz_pitanja1', {
              predmeti_sr: results,
              putnik1: iz_pitanja_p,
              title: iz_pitanja_p
            });
          }
        );

        // verzija bez prepared statements
        //
        // connection.query (
        //   'SELECT DISTINCT obrazovni_profil, razred \
        //   FROM temp_pitanja \
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

      } else if (property.includes('radio2')) { // izbor obrazovnog profila i razreda (predmet se prenosi iz prethodne strane)

        //onesposobljeno čišćenje članova niza od space jer ih onda ne nalazi u bazi bez space
        //iz_pitanja.radio2 = iz_pitanja.radio2.trim();

        //pakovanje u 1d niz
        let niz_iz_pitanja = iz_pitanja.radio2.split("|");

        // escaping i sanitacija

        for (const e in niz_iz_pitanja) {
          niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/"/g, "\\\"");
          niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/'/g, "\\\'");
          niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/;/g, "\\;");
          niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/&/g, "\\&");
          niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/=/g, "\\=");
          niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/</g, "&lt;");
          niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/>/g, "&gt;");
          niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/\.js/g, "\\.js");
        }
        
        iz_pitanja_op = niz_iz_pitanja[0]; // obrazovni profil
        iz_pitanja_r = niz_iz_pitanja[1]; // razred
        iz_pitanja_p = niz_iz_pitanja[2]; // predmet

        //pravljenje naslova za sledeću stranu
        let h4_oprp = iz_pitanja_op + ', ' + iz_pitanja_r + ', ' + iz_pitanja_p;

        //console.log('iz_pitanja r2', iz_pitanja_op, iz_pitanja_r, iz_pitanja_p);

        
        // prepared statements

        // pripremljeni podaci nakon sanitacije unosa moraju da budu u formi niza
        let sql_prepared_data = [];

        // sql pripremljen upit
        let sql_prepared_statement = 'SELECT DISTINCT oblast, lekcija \
          FROM temp_pitanja \
          WHERE obrazovni_profil = ? AND razred = ? AND predmet = ? \
          ORDER BY oblast;';

        //console.log('sql tekst: ', sql);

        // pripremljeni podaci
        sql_prepared_data = [
          iz_pitanja_op,
          iz_pitanja_r,
          iz_pitanja_p
        ];

        //console.log('\nsql upit pre execute u bazu:\n' + sql_prepared_statement);
        //console.log('\ndata niz (' + sql_prepared_data.length + ') pre execute u bazu:\n' + sql_prepared_data);

        connection.execute(
          sql_prepared_statement,
          sql_prepared_data,
          function(err, results, fields) {
            if (err) throw err;
            
            res.render('pitanja/iz_pitanja2', {
              predmeti_sr_ol: results,
              h4_oprp: h4_oprp,
              putnik2: iz_pitanja.radio2,
              title: 'Pitanja'
            });

          }
        );

        break;

      } else if (property.includes('check3')) { // izbor za oblast/i i lekciju/e

        let niz_iz_pitanja = []; // biće 1d ili 2d niz
        let podnaslovi = [];
        let h4_oprp = '';

        let jedan_string = false;

        let sql_prepared_statement = '';
        let sql_prepared_data = [];
        let sqlx = ' ORDER BY t_rb;';

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

          // onesposobljeno čišćenje članova niza od space jer ih onda ne nalazi u bazi bez space
          //iz_pitanja.check3 = iz_pitanja.check3.trim();

          // pakovanje u 1d niz
          niz_iz_pitanja = iz_pitanja.check3.split("|");

          // escaping i sanitacija
          for (const e in niz_iz_pitanja) {
            niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/"/g, "\\\"");
            niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/'/g, "\\\'");
            niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/;/g, "\\;");
            niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/&/g, "\\&");
            niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/=/g, "\\=");
            niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/</g, "&lt;");
            niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/>/g, "&gt;");
            niz_iz_pitanja[e] = niz_iz_pitanja[e].replace(/\.js/g, "\\.js");
          }

          // građenje višestrukog podnaslova za novu stranu iako ima samo jedan niz
          // to je neophodno da se ne bi gradila komplikovana procedura u strani iz_pitanja3.ejs
          // da bi se ona snalazila i sa 1d i sa 2d nizovima
          podnaslovi[0] = [niz_iz_pitanja[0], niz_iz_pitanja[1]];

          // pravljenje naslova za sledeću stranu
          h4_oprp = niz_iz_pitanja[2] + ', ' + niz_iz_pitanja[3] + ', ' + niz_iz_pitanja[4];

          sql_prepared_statement =
            'SELECT t_rb, pitanje, odgovor, tekst_link, foto_link, video_link \
            FROM temp_pitanja \
            WHERE \
            obrazovni_profil = ? AND razred = ? AND predmet = ? AND oblast = ? AND lekcija = ?';

          sql_prepared_data = [
            niz_iz_pitanja[2],
            niz_iz_pitanja[3],
            niz_iz_pitanja[4],
            niz_iz_pitanja[0],
            niz_iz_pitanja[1]
          ];

        } else { // ima više stringova

          for (let i = 0; i < iz_pitanja.check3.length; i++) {

            // onesposobljeno čišćenje članova niza od space jer ih onda ne nalazi u bazi bez space
            //iz_pitanja.check3[i] = iz_pitanja.check3[i].trim();

            //pakovanje u 2d niz
            niz_iz_pitanja[i] = iz_pitanja.check3[i].split("|");

            // escaping i sanitacija
            for (const e in niz_iz_pitanja[i]) {
              niz_iz_pitanja[i][e] = niz_iz_pitanja[i][e].replace(/"/g, "\\\"");
              niz_iz_pitanja[i][e] = niz_iz_pitanja[i][e].replace(/'/g, "\\\'");
              niz_iz_pitanja[i][e] = niz_iz_pitanja[i][e].replace(/;/g, "\\;");
              niz_iz_pitanja[i][e] = niz_iz_pitanja[i][e].replace(/&/g, "\\&");
              niz_iz_pitanja[i][e] = niz_iz_pitanja[i][e].replace(/=/g, "\\=");
              niz_iz_pitanja[i][e] = niz_iz_pitanja[i][e].replace(/</g, "&lt;");
              niz_iz_pitanja[i][e] = niz_iz_pitanja[i][e].replace(/>/g, "&gt;");
              niz_iz_pitanja[i][e] = niz_iz_pitanja[i][e].replace(/\.js/g, "\\.js");
            }
  
            // građenje višestrukog podnaslova za novu stranu
            podnaslovi[i] = [niz_iz_pitanja[i][0], niz_iz_pitanja[i][1]];
  
            // pravljenje višetrukog query sa UNION SELECT

            if (niz_iz_pitanja.length == 1) { // kada, u početku for petlje, 2d niz ima samo 1 člana onda se uzima početak sql upita

              sql_prepared_statement =
              'SELECT t_rb, pitanje, odgovor, tekst_link, foto_link, video_link \
              FROM temp_pitanja \
              WHERE \
              obrazovni_profil = ? AND razred = ? AND predmet = ? AND oblast = ? AND lekcija = ?';

              sql_prepared_data = [
                niz_iz_pitanja[i][2],
                niz_iz_pitanja[i][3],
                niz_iz_pitanja[i][4],
                niz_iz_pitanja[i][0],
                niz_iz_pitanja[i][1]
              ];

            } else { // kada, u nastavku for petlje, 2d niz ima više članova onda se dodaje union

              sql_prepared_statement +=
              ' UNION ALL \
              SELECT t_rb, pitanje, odgovor, tekst_link, foto_link, video_link \
              FROM temp_pitanja \
              WHERE \
              obrazovni_profil = ? AND razred = ? AND predmet = ? AND oblast = ? AND lekcija = ?';
              // SELECT column_name(s) FROM table1
              // UNION ALL
              // SELECT column_name(s) FROM table2;

              sql_prepared_data.push(
                niz_iz_pitanja[i][2],
                niz_iz_pitanja[i][3],
                niz_iz_pitanja[i][4],
                niz_iz_pitanja[i][0],
                niz_iz_pitanja[i][1]
              );

            }
          }

          // pravljenje naslova za sledeću stranu
          // dvodimenzionalni niz ali su u svim pod nizovima ista polja za smer, razred i predmet
          h4_oprp = niz_iz_pitanja[0][2] + ', ' + niz_iz_pitanja[0][3] + ', ' + niz_iz_pitanja[0][4];

        }

        sql_prepared_statement += sqlx; //dodaje se završetak i sortiranje

        connection.execute(
          sql_prepared_statement,
          sql_prepared_data,
          function(err, results, fields) {
            if (err) throw err;
            
            res.render('pitanja/iz_pitanja3', {
              predmeti_sr_ol_5: results,
              h4_oprp: h4_oprp,
              podnaslovi: podnaslovi,
              title: 'Pitanja'
            });

          }
        );

        break;

      } else {
        console.log('neki radio ili check nije prošao');
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



// ****************************************************************
// izbacuje form za upis novih testova
// ****************************************************************
const c_test_create_get = (req, res) => {
  res.render('c_test/create', { title: 'Novi test' });
}



// ****************************************************************
// upisuje nove testove u bazu
// ****************************************************************
const c_test_create_post = (req, res) => {

  // detaljni i opširni komentari za ovdašnji kod su u
  // bekap verzijama pitanjaControllers jer je kod sličan

  let upis = req.body;
  //console.log(req);

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
  let tip = 'c_test';
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
          upis['odg_'+p+'_2'] = ciscenje.validacija(upis['odg_'+p+'_2'], 1, 1, 300, 1);
          upis['odg_'+p+'_3'] = ciscenje.validacija(upis['odg_'+p+'_3'], 1, 1, 300, 1);
          upis['odg_'+p+'_4'] = ciscenje.validacija(upis['odg_'+p+'_4'], 1, 1, 300, 1);
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
            '_1, odg_' + i +
            '_2, odg_' + i +
            '_3, odg_' + i +
            '_4, r_'+ i +
            ', ';

            // sklapanje druge polovine drugog dela sql pripremljenog upita
            sql2b +=
            '?, ' + //upis['pitanje_' + i]
            '?, ' + //upis['odg_' + i + '_1']
            '?, ' + //upis['odg_' + i + '_2']
            '?, ' + //upis['odg_' + i + '_3']
            '?, ' + //upis['odg_' + i + '_4']
            '?, ';  //upis['r_' + i]
            //console.log('sql2b: ', sql2b);

            // popunjavanje druge polovine sql pripremljenih podataka
            sql_prepared_data_2.push(
              upis['pitanje_' + i],
              upis['odg_' + i + '_1'],
              upis['odg_' + i + '_2'],
              upis['odg_' + i + '_3'],
              upis['odg_' + i + '_4'],
              upis['r_'+i]
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
    res.redirect('/c_test/c_tests');

  });

}




module.exports = {
  c_tests_get,
  c_test_get,

  c_test_create_get,
  c_test_create_post,
}