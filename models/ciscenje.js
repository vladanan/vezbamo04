// VALIDACIJA i SANITACIJA

// https://www.w3schools.com/sql/sql_injection.asp
// https://en.wikipedia.org/wiki/SQL_injection
// https://en.wikipedia.org/wiki/Cross-site_scripting
// mysql2a ima escaping i prepared statements:
// https://github.com/mysqljs/mysql#escaping-query-values
// https://github.com/sidorares/node-mysql2a#using-prepared-statements

// detaljna objašenja funkcija i koda za ovaj modul su u funkciji ciscenje()


// VALIDACIJA unosa u bazu:
// trim: trimuje space - 0/1
// upper_case: stavlja velika početna slova - 0/1
// len: skraćuje tekst na zadatu dužinu - 0-n
// semicolon: escapuje ; sa \; - 0/1
//
var validacija = (tekst, trim, upper_case, len, semicolon) => {

    if (trim == 1) {
        
        tekst = tekst.trim();

    }

    if (upper_case == 1){

        tekst = tekst.replace(
            /^([a-zčćđžšабвгдђежзијклљмнњопрстћуфхцчџш])/,
            function (x) {
                return x.toUpperCase();
            }
        );

    }

    if (len > 0) {

        tekst = tekst.substring(0, len);

    }

    if (semicolon == 1) {

        tekst = tekst.replace(/;/g, "\\;");

    }

    return tekst;

}


// SANITACIJA izlaza u html stranu
// json: ' " ali budući da su ' i " već obrađeni ide & i \ - 0/1
// char: zamena sa html entities za: ' " < > ( ) [ ] { } - 0/1
// tag: zamena verzijama sa _: script = s_cript - 0/1
// event: zamena .js i onclick - 0/1
//
var sanitacija = (tekst, json, char, tag, event) => {

    // ovaj deo za karaktere koji smetaju json-u
    // mora pre drugih da ne bi na kraju izmenjao & i \ u ostalim kodovima
    if (json == 1) {

        tekst = tekst.replace(/&/gm, "&amp;");
        tekst = tekst.replace(/\u005C/gm, "&bsol;"); // \ &bsol; ( / &sol; )

    }

    if (char == 1) {

        // escape za ; je već urađen prilikom upisa u bazu
        // koristi se HTML name code a ako nema onda JS escape sequence za Unicode

        // izgleda da ejs ili browser escapuje automatski ' " i <> brojčanim html kodovima:
        // &#39; &#34; &lt; &gt;
        // i to radi čak i kada dobije &apos; &quot; za ' i "
        // ali za svaki slučaj valja to odraditi ovde i ručno

        tekst = tekst.replace(/'/gm, "&apos;");
        tekst = tekst.replace(/"/gm, "&quot;");

        tekst = tekst.replace(/</gm, "&lt;"); //unicode &#u003C  &#u003E
        tekst = tekst.replace(/>/gm, "&gt;"); //unicode &#003C  &#003E

        tekst = tekst.replace(/\u0028/gm, "&lpar;"); // ( unicode &#u0028
        tekst = tekst.replace(/\u0029/gm, "&rpar;"); // ( unicode &#u0029

        tekst = tekst.replace(/\u005B/gm, "&lsqb;"); // [ unicode &#u005B
        tekst = tekst.replace(/\u005D/gm, "&rsqb;"); // ] unicode &#u005D

        tekst = tekst.replace(/\u007B/gm, "&lcub;"); // { unicode &#u007B
        tekst = tekst.replace(/\u007D/gm, "&rcub;"); // } unicode &#u007D

    }

    if (tag == 1) {

        tekst = tekst.replace(/script/gim, "s_cript");
        tekst = tekst.replace(/object/gim, "o_bject");
        tekst = tekst.replace(/embed/gim, "e_mbed");
        tekst = tekst.replace(/link/gim, "l_ink");
        tekst = tekst.replace(/iframe/gim, "i_frame");
        tekst = tekst.replace(/href/gim, "h_ref");

        // u bazi je ; escapovan sa \; a gore u prvom json delu \ je pretvoren u &bsol;
        // sada se tamo gde su zajedno \; tj. &bsol;; vraćaju u ;
        tekst = tekst.replace(/&bsol;;/gim, ";");

    }

    if (event == 1) {

        tekst = tekst.replace(/\.js/gim, "_.js");
        tekst = tekst.replace(/onclick/gim, "o_nclick");

    }

    return tekst;

}




// cisti_sve:
// trimuje space 0/1
// upc: stavlja velika početna slova 0/1
// len skraćuje tekst na zadatu dužinu 0-n
// mysql2 sanitacija 0/1
// esc dodatni escaping 0/1
//
var cisti_sve = (tekst, trim, upc, len, san, esc) => {

    if (trim == 1) {

        // pre provere dužine stringova i sanitacije mora da se skinu SPACE i postave VELIKA SLOVA
        // u principu nije bitno da li su početna slova velika ili mala ali svakako valja da bude
        // po celom sajtu sve jednoobrazno i odlučio sam se za velika slova jer kulturnije izgleda

        tekst = tekst.trim();

    }


    if (upc == 1){

        // UPPER CASE  let result = text.toUpperCase();
        // ' nalazi prvo slovo u tekstu "^([a-b])" i menja bilo čim: $1nešto
        // u konzoli radi samo za a-z engleske abecede ali ne i za unicode žćčđš i ćirilicu
        // tako da to mora ručno da se unese
        // jer mogu da se pozivaju samo pojedinačni unicode karakteri

        tekst = tekst.replace(/^([a-zčćđžšабвгдђежзијклљмнњопрстћуфхцчџш])/, function (x) {
            return x.toUpperCase();
        });

    }


    if (len > 0) {

        // DUŽINE STRINGOVA: pre sanitacije i escapinga proveravaju se dužine
        // u skladu sa bazom i html5 postavkama
        // razlog je što neko može da koristi lažne umetnute html stranice, formulare ili url adrese
        // da bi poslao dugačke stringove sa skriptovima
        //
        // js meri stringove od 0 tako da ako je ograničenje u bazi varchar(45)
        // onda je u js 45. karakter na poziciji 44
        // substring seče od pozicije na prvom parametru uključujući i njega
        // do pozicije na drugom parametru ne uključujući i njega
        // (ako drugog nema onda seče sve do kraja stringa)
        // to znači da 0-300 uključuje 0-299 što je ukupno 300 karaktera

        tekst = tekst.substring(0, len);

    }


    if (san == 1) {

        // mysql2a ESCAPING sanitacija za sve elemente iz upita i iz req
        // ovde ne radi je nema con tj. connection a njeno prosleđivanje obično ne radi
        // kako treba pa ću to da u svim komandama u kontroleru izbacim a ovde
        // će da ostane ako zatreba
        //
        // u php funkcija real_escape_string() stavlja backslashes i ispred: \x00, \n, \r, \, ', " and \x1a
        // budući da mysql2 escape stavlja backslashes ispred \ i ispred ' i " onda automatski pokriva i sve ovo

        tekst = con.escape(tekst);

        // skidanje ' ili " na kraju koje escape dodaje jer ih već imaju iz nizova i objekata
        // što čini da u bazu odlaze sa duplim navođenjem i prikazuju pod navodnicima
        // ako već ima ' i " onda postavlja backticks ` (AltGr+7) pa mora i to da se ispita
        // ali: iako se u prikazu objekata vide backticks u ispitivanju stringa i karaktera i nizova
        // vide se kao ' tako da if petlja ne služi ničemu niti znam da li dobro radi kada je uslov
        // ispunjen ali sam je ostavio za svaki slučaj

        if (
            tekst.startsWith('`') &&
            tekst.endsWith('`')
        ) {

            //console.log('ima `: '+tekst);
            tekst = '`' + tekst.slice(2, tekst.length-1) + '`';
        
        } else {

            //console.log('nema `: '+tekst);
            const nema_bt = tekst.split('');
            //console.log('nemabt pre:'+nema_bt+'niz:'+nema_bt.length);
            nema_bt.pop();
            nema_bt.shift();
            //console.log('nemabt posle:'+nema_bt);
            tekst = nema_bt.join('');
            //console.log('upis element:'+tekst);
        
        }

    }


    if (esc == 1) {

        // escaping materijal i tools
        //https://www.rapidtables.com/web/html/html-codes.html
        //https://mathiasbynens.be/notes/javascript-escapes

        // DODATNI ESCAPE i zbog XSS napada za karaktere koji se koriste i u sql injection a msql2a escape ih ne čisti
        //
        // (doduše mysql2a escape sve pakuje kao string i stavlja u bezbedno okruženje tako da unosi ne mogu da se izvršavaju jer ne idu direktno u sql upit ali sam to očistio zbog prepared statements)
        // budući da mysql2a escape escapuje i sam ecsape karakter \ onda moj ručni escape
        // mora da ide posle njega i to sa dva \ jer se jedan od njih automatski briše u mysql bazi

        //escape za ; i & ide pre >< jer se menjaju sa oznakama koje sadrže ;
        tekst = tekst.replace(/"/g, "\\\"");
        tekst = tekst.replace(/'/g, "\\\'");
        tekst = tekst.replace(/;/g, "\\;");
        tekst = tekst.replace(/&/g, "\\&");
        tekst = tekst.replace(/=/g, "\\=");
        tekst = tekst.replace(/</g, "&lt;"); //hex escape: < \x3C  > \x3E  unicode \u003C  \u003E
        tekst = tekst.replace(/>/g, "&gt;"); //html escape: < &lt;  > &gt; 
        tekst = tekst.replace(/\.js/g, "\\.js");

    }

    //console.log(tekst);
    return tekst;

}



var myDateTime = () => {
    return Date();
};

module.exports = {
    validacija,
    sanitacija,
    cisti_sve,
    myDateTime
}