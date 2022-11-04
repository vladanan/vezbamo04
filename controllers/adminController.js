var createConnection = require('../models/baza');
var ciscenje = require('../models/ciscenje');


// glavna admin strana
const main = (req, res) => {

  //console.log('admin main')

  res.render('admin1/main', { title: 'Admin'});
  
}



// prikazuje form za update testova i pitanja
const update_get = (req, res) => {

  //console.log('izmene')

  createConnection(function(err, connection) {
    if (err) {
      //console.log('greška: ' + err);
      throw err;
    }

    // qery za spisak svih testova
    connection.query(
      'SELECT g_id, tip, obrazovni_profil, razred, predmet, oblast FROM g_pitanja_c_testovi;',
      function (err, results, fields) {
        if (err) throw err;
        res.render('admin1/update', { pite: results, title: 'Admin'});
      }
    );

    connection.release();
  });

  
}



// ****************************************************************
// updatuje testove ili pitanja u bazi
// ****************************************************************
const update_post = (req, res) => {

  //console.log('update post')

  // detaljni i opširni komentari za ovdašnji kod su u
  // bekap verzijama pitanjaControllers jer je kod sličan

  let upis = req.body;
  //console.log(req);

  let sql_prepared_data = [];
  let sql_prepared_data_1 = [];
  let sql_prepared_data_2 = [];
  let sql_prepared_data_3 = [];

  let sql_prepared_statement = '';

  let sql1a = '';
  let sql1b = '';
  let sql1c = '';

  let sql2a = '';
  let sql2b = '';

  let sqlx = 'end WHERE g_id = ?;'; //završni deo sql upita

  // let datum = new Date;

  // za user_id PROMENITI kako valja KADA SE URADI AUTENTIKACIJA
  let rb = upis.rb;
  let tip = upis.tip;
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
    upis.rb = ciscenje.validacija(upis.rb, 1, 0, 11, 1);

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
    sql1a = 'UPDATE g_pitanja_c_testovi SET tip=?, obrazovni_profil=?, razred=?, predmet=?, oblast=?, link1=?, link2=?, link3=?, user_id=?, from_url=?, datum_upisa=?, ';

    // iz petlje: sql1b = pitanje_1, odgovor_1_1 _2 _3 _4, r_1 ... ... ...

    // sql1c = 'end) VALUES (';

    // // sklapanje prve polovine drugog dela sql pripremljenog upita
    // sql2a =
    //   '?, ' + //upis.tip
    //   '?, ' + //upis.obrazovni_profil
    //   '?, ' + //upis.razred
    //   '?, ' + //upis.predmet
    //   '?, ' + //upis.oblast
    //   '?, ' + //upis.link1
    //   '?, ' + //upis.link2
    //   '?, ' + //upis.link3
    //   '?, ' + //from_req.user_id
    //   '?, ';  //from_req.from_url

    // // pravi se u petlji: sql2b = ??? ??? ??? ... ... ...

    // sklapanje prve polovine sql pripremljenih podataka nakon sanitacije unosa
    let datum = new Date;

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
      from_req.host_path,
      datum
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
            'pitanje_'+ i + '=?' +
            ', odg_' + i +
            '_1=?, odg_' + i +
            '_2=?, odg_' + i +
            '_3=?, odg_' + i +
            '_4=?, r_'+ i + '=?' +
            ', ';

            // // sklapanje druge polovine drugog dela sql pripremljenog upita
            // sql2b +=
            // '?, ' + //upis['pitanje_' + i]
            // '?, ' + //upis['odg_' + i + '_1']
            // '?, ' + //upis['odg_' + i + '_2']
            // '?, ' + //upis['odg_' + i + '_3']
            // '?, ' + //upis['odg_' + i + '_4']
            // '?, ';  //upis['r_' + i]
            // //console.log('sql2b: ', sql2b);

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
    //sql_prepared_statement = sql1a + sql1b + sql1c + sql2a + sql2b + sqlx;
    sql_prepared_statement = sql1a + sql1b + sqlx;

    // čišćenje od nepotrebnih zareza na krajevima uz pomoć end umetnutog završetka
    sql_prepared_statement = sql_prepared_statement.replace(/, end/g, "");

    sql_prepared_data_3 = [rb];
    sql_prepared_data = sql_prepared_data.concat(sql_prepared_data_1);
    sql_prepared_data = sql_prepared_data.concat(sql_prepared_data_2);
    sql_prepared_data = sql_prepared_data.concat(sql_prepared_data_3);
    
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
    sql_prepared_data_3 = [];

    con.release();

    let redirekt;

    if (tip == 'c_test') {
      redirekt = '/c_test/c_tests';
    } else if (tip == 'pitanja' ) {
      redirekt = '/pitanja/pitanja';
    }
    
    res.redirect('/admin1/update');

  });

}



// form da briše redove ili da se sređuju indeksi u bazi
const del_index = (req, res) => {

  //console.log('del_index')

  createConnection(function(err, connection) {
    if (err) {
      //console.log('greška: ' + err);
      throw err;
    }

    // qery za broj upisanih redova // WHERE condition //broj_redova = results[0]['COUNT (g_id)'];
    let broj_redova;
    
    // connection.query(
    //   'SELECT COUNT (g_id) FROM g_pitanja_c_testovi;'),
    //   function (err, results, fields) {
    //   if (err) throw err;
    //   broj_redova = 6;//results;
    // };

    // qery za spisak svih testova
    connection.query(
      'SELECT g_id, tip, obrazovni_profil, razred, predmet, oblast FROM g_pitanja_c_testovi;',
      function (err, results, fields) {
        if (err) throw err;
        res.render('admin1/del_index', {
          pite: results,
          broj_redova: results.length,
          title: 'Admin'
        });
      }
    );

    connection.release();
  });

  
}



// ****************************************************************
// briše testove ili pitanja iz baze
// ****************************************************************
const delete_rows = (req, res) => {

  //console.log('delete post')

  let upis = req.body;
  //console.log(upis);
  let sql_prepared_data = [];
  let sql_prepared_statement = '';
  let rb = upis.delete;

  createConnection(function(err, con) {
    if (err) {
      //console.log('greška: ' + err);
      throw err;
    }

    // validacija = (tekst, trim, upper_case, len, semicolon)
    rb = ciscenje.validacija(rb, 1, 0, 11, 1);

    // if (upis.razred.length > 1) {
    //   upis.razred = '8';
    // }
    // if (upis.razred > 8) {
    //   upis.razred = '8';
    // }

    sql_prepared_statement = 'DELETE FROM g_pitanja_c_testovi WHERE g_id = ?';
    sql_prepared_data = [rb];

    con.execute(
      sql_prepared_statement,
      sql_prepared_data,
      function(err, results, fields) {
        if (err) throw err;
      }
    );

    sql_prepared_statement = '';
    sql_prepared_data = [];

    con.release();

    res.redirect('/admin1/del_index');

  });

}



// vadi broj broj upisanih redova u tabelu i niz samih indeksa
async function br_rd () {

  //https://dev.to/kalashin1/mastering-asynchronous-operations-in-javascript-1712
  //https://stackoverflow.com/questions/36547292/use-promise-to-process-mysql-return-value-in-node-js

  const mysql = require('mysql2/promise');

  const con = await mysql.createConnection({
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

  // qery za broj upisanih redova // WHERE condition //broj_redova = results[0]['COUNT (g_id)'];
  let [broj_redova] = await con.query('SELECT COUNT (g_id) FROM g_pitanja_c_testovi;');

  // qery za indekse redova
  let [redovi] = await con.query('SELECT g_id FROM g_pitanja_c_testovi;');

  br = {
    broj_redova,
    redovi
  }

  return br;

}

// ****************************************************************
// sređuje indekse ako ima rupa
// ****************************************************************
const index_repair = (req, res) => {

  console.log('index_repair:')
  
  let broj_redova = 0;
  let index = 0;
  let redovi = [];

  br = br_rd(); //poziva async func koja vadi broj broj upisanih redova u tabelu i niz samih indeksa
  br.then(function(result) {
    // results daje komplikovan objekat sa nizovima i objektima i mora iz toga da se izvadi niz brojeva redova
    //console.log('rez: ', result)
    broj_redova = result['broj_redova'][0]['COUNT (g_id)'];
    // redovi2 = result['redovi'][1];
    // console.log(redovi2)
    
    result['redovi'].forEach(element => {
      redovi[index] = element['g_id'];
      index++;
    });

    console.log('broj redova u tabeli: ', broj_redova, '\nrb u tabeli:', redovi, '\n')

    createConnection(function(err, connection) {
      if (err) {
        //console.log('greška: ' + err);
        throw err;
      }
  
      //upis indexa
      for (let i = 1; i < (broj_redova+1); i++) {

        console.log('stari rb: ', redovi[i-1], ', novi rb: ', i, )

        connection.query(
          'UPDATE g_pitanja_c_testovi SET g_id = ' + i + ' WHERE g_id = ' + redovi[i-1] + ' ;',
          function (err, results, fields) {
            if (err) throw err;
            //console.log(results)
          }
        );

      }

      connection.query(
        'ALTER TABLE g_pitanja_c_testovi AUTO_INCREMENT = ' + (broj_redova + 1) + ';',
        function (err, results, fields) {
          if (err) throw err;
        }
      );

      console.log('novi auto increment: ', (broj_redova + 1))

      connection.release();
    });

  });

  res.redirect('/admin1/del_index');

}



module.exports = {
  main,
  update_get,
  update_post,
  del_index,
  delete_rows,
  index_repair
}