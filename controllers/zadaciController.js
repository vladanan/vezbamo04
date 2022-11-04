const zadaci = (req, res) => {

  res.render('zadaci/zadaci', { title: 'Svi zadaci' });
  
}

const o1m_1_10 = (req, res) => {

  res.render('zadaci/o1m_1_10', { title: '1-10' });
  
}

const o1m_1_10txt = (req, res) => {

  res.render('zadaci/o1m_1_10txt', { title: '1-10t' });
  
}

const s1m_kombi = (req, res) => {

  res.render('zadaci/s1m_kombi', { title: 'Kombi' });
  
}

module.exports = {
  zadaci,
  o1m_1_10,
  o1m_1_10txt,
  s1m_kombi
}