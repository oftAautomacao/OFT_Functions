/* eslint-disable linebreak-style */
// rastreamento de depuração: node --trace-deprecation index.js
// firebase deploy --only functions:drmAtendimentoWAKatia
// Antes do DEPLOY:automatico
//  - ambiente = producao
//  - testeCelularZApi = off
//  - firebase use oftautomacao-9b427 ou firebase use teste-b720c
//  - retirar webhook do ZAPI RDH
const ambiente = "teste"; // teste ou producao
const envio = "teste"; // teste ou producao
const local = "firebase"; // emulador ou firebase
const execucaoFuntions = "firebase"; // emulador ou firebase
const localLog = "googleCloud"; // googleCloud ou rtDataBase

// ativar a função CelularZApi (on ou off)
const testeCelularZApi = "off";
// const Imap = require("imap"); // para trabalhar com email

// const inspect = require("util").inspect;
// const {simpleParser} = require("mailparser");

const medicoAusente = "";
// const medicoAusente = "Priscila Stalleiken Sebba";
const medicoAusente2 = "";
const medicoAusente3 = "";

// const imapLerEmail = new Imap({
//   user: "Oftautomacao@gmail.com",
//   password: "rimNug-moknod-xujni0",
//   host: "imap.skymail.net.br",
//   port: 993,
//   tls: true,
//   tlsOptions: {
//     rejectUnauthorized: false,
//   },
// });

// const imap = new Imap({
//   user: "alexandrelobo@riodayhospital.com.br",
//   password: "pidwEp-nynbyr-masdi0",
//   host: "imap.skymail.net.br",
//   port: 993,
//   tls: true,
//   tlsOptions: {
//     rejectUnauthorized: false,
//   },
// });

// const imapCatarata = new Imap({
//   user: "alexandrelobo@oftalmoday.com.br",
//   password: "qukhuq-nejvif-wowwU1",
//   host: "br426.hostgator.com.br",
//   port: 993,
//   tls: true,
//   tlsOptions: {
//     rejectUnauthorized: false,
//   },
// });

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "oftautomacao@hotmail.com",
    pass: "rimNug-moknod-xujni0",
  },
});

// const dialogflow = require("dialogflow");
// const sessionClient = new dialogflow.SessionsClient();
const functions = require("firebase-functions/v1");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const cors = require("cors")({origin: true});
const sqlConnection = require("mssql");
const admin = require("firebase-admin");
const emoji = require("node-emoji");
const https = require("https");

// if ((ambiente === "teste")&&(local === "firebase")) {
if (ambiente === "teste") {
  // Fetch the service account key JSON file contents
  const serviceAccount =
  require("./teste-b720c-firebase-adminsdk-8gcib-d94e263e00.json");
  // Initialize the app with a service account, granting admin privileges
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // The database URL depends on the location of the database
    databaseURL: "https://teste-b720c-default-rtdb.firebaseio.com",
    storageBucket: "gs://teste-b720c.appspot.com/",
  });
} else {
  // Fetch the service account key JSON file contents
  const serviceAccount =
  require("./oftautomacao-9b427-firebase-adminsdk-zd3ss-113631cf0a.json");
  // Initialize the app with a service account, granting admin privileges
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // The database URL depends on the location of the database
    databaseURL: "https://oftautomacao-9b427-default-rtdb.firebaseio.com/",
    storageBucket: "gs://oftautomacao-9b427.appspot.com/",
  });
}

// const projectId = "oftautomacao-9b427";

let sqlConfig = {};
let cioSqlConfig = {};
// let swSqlConfig = {};

if (local === "emulador") {
  sqlConfig = {
    user: functions.config().sqlserver.usuario,
    password: functions.config().sqlserver.senha,
    database: "ASADB",
    server: "192.168.0.201",
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 3000000,
    },
    options: {
      encrypt: true, // for azure
      trustServerCertificate: true,
      // change to true for local dev / self-signed certs
    },
  };
} else {
  sqlConfig = {
    user: functions.config().sqlserver.usuario,
    password: functions.config().sqlserver.senha,
    server: "oftalclinsrv.no-ip.org",
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 3000000,
    },
    options: {
      encrypt: true, // for azure
      trustServerCertificate: true,
      // change to true for local dev / self-signed certs
    },
  };
}

cioSqlConfig = {
  user: "consulta",
  password: "Ciom2552@",
  database: "ASADB",
  server: "ciomoi.ddns.net",
  port: 8282,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 3000000,
  },
  options: {
    database: "ASADB",
    encrypt: false, // for azure
    trustServerCertificate: true,
    // change to true for local dev / self-signed certs
  },
};


// if (local === "emulador") {
// swSqlConfig = {
//   user: functions.config().sqlserver.usuario,
//   password: functions.config().sqlserver.senha,
//   database: "LOBODB",
//   server: "192.168.0.201",
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 3000000,
//   },
//   options: {
//     encrypt: true,
//     trustServerCertificate: true,
//   },
// };
// } else {
// swSqlConfig = {
//   user: functions.config().sqlserver.usuario,
//   password: functions.config().sqlserver.senha,
//   database: "LOBODB",
//   server: "oftalclinsrv.no-ip.org",
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 3000000,
//   },
//   options: {
//     encrypt: true,
//     trustServerCertificate: true,
//   },
// };
// }

const busboy = require("busboy");


/**
 * celular zapi.
 * @constructor
 * @param {JSON} postData = {whatsAppCel, id, token} - parametros entrada
 * @param {string} chamarFunctionMsgReceb - Index of arrays
 */
function celularZApi(postData, chamarFunctionMsgReceb) {
  console.log("Entrou na função CelularZApi");

  // console.log("............... MENSAGEM ...............");
  // console.log(postData);

  if (chamarFunctionMsgReceb == "run" ) {
    const request = new XMLHttpRequest();

    // versão 2
    // const urlZapi = "http://localhost:5001/oftautomacao-9b427/" +
    // "us-central1/mensagemRecebidaZApiWHv2";

    // versão 3
    const urlZapi = "http://localhost:5001/oftautomacao-9b427/" +
    "us-central1/oft45MensagemRecebidaZApiWH";

    request.open("POST", urlZapi, true);
    request.setRequestHeader("Content-Type", "application/json");

    const postData2 = JSON.stringify({
      "phone": "5521971938840",
      "buttonsResponseMessage": {
        "buttonId": "BSCATV45-AGDCONS",
      },
    });
    // BSCATVCTRT-AGDCONS
    // BSCATVCTRT-CANCMSG
    // BSCATVCTRT-LMBR2MESES
    // BSCATVCTRT-LMBR4MESES
    // BSCATVCTRT-LMBR6MESES
    request.send(postData2);

    request.onload = () => {
      if (request.status == 200) {
        console.log(" oft45MensagemRecebidaZApiWH chamado com sucesso.");
        return null;
      } else {
        console.log("Erro chamando oft45MensagemRecebidaZApiWH.");
        return null;
      }
    };
  }
}


const buscaAtivaEmpresa = "CIO";

exports.ciobuscaAtivaCriarNo = functions.https.
    onRequest((req, resp) => {
      console.log("Entrou no ciobuscaAtivaCriarNo");

      const db = admin.database();
      db.ref(buscaAtivaEmpresa + "/buscaAtiva/enviados/").set(true);
      db.ref(buscaAtivaEmpresa +
                  "/buscaAtiva/configuracoes/quantidadeEnvio/").set(1);
      resp.end("Ok\n"+resp.status.toString());
    });


// exports.cioBuscaAtivaCargaMensal = functions.
//     runWith({timeoutSeconds: 540, memory: "512MB"}).https.
//     onRequest((req, resp) => {
exports.cioBuscaAtivaCargaMensal = functions
    .runWith({timeoutSeconds: 540, memory: "512MB"}).pubsub
    .schedule("00 18 * * *")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("ENTROU cioBuscaAtivaCargaMensal");
      const dbRef = admin.database();

      console.log("VAI ENTRAR NO DBREF");
      return dbRef.ref(buscaAtivaEmpresa +
            "/buscaAtiva/pacientesCompleto").set(null)

          .then(() => {
            console.log("ENTROU NO DBREF");
            try {
              return sqlConnection.connect(cioSqlConfig).then((pool) => {
                console.log("ENTROU NO QUERY");
                let queryBuscaAtiva = "";
                queryBuscaAtiva = "SELECT * FROM dbo.vw_Excel_Sis_Atendimento";
                queryBuscaAtiva = queryBuscaAtiva + "_Busca_Ativa_Ciom ";
                queryBuscaAtiva = queryBuscaAtiva + "ORDER BY DataAtendimento";

                return pool.query(queryBuscaAtiva);
              }).then((result) => {
                let codPac = "";
                const buscaAtivaJson = {};
                result.recordset.forEach((element) => {
                  if (element.CodPaciente && element.Telefone &&
                    tel2Whats(element.Telefone)) {
                    codPac = "codPac_"+element.CodPaciente+"_"+
                      tel2Whats(element.Telefone);
                    const qtdcodPac = codPac.length;
                    if (qtdcodPac <= 30) {
                      const strData = JSON.stringify(element.DataAtendimento);
                      element.DataAtendimento = JSON.parse(strData);
                      buscaAtivaJson[codPac] = element;
                    }
                  }
                });
                dbRef.ref(buscaAtivaEmpresa + "/buscaAtiva/pacientesCompleto")
                    .set(buscaAtivaJson);

                // resp.end("Ok"+resp.status.toString());
                return null;
              });
            } catch (err) {
            // ... error checks
              console.log("Erro try: " + JSON.stringify(err));
            }
          });
    });


// exports.cioBuscaAtivaJson = functions.runWith({timeoutSeconds: 540}).https
//     .onRequest((req, resp) => {
exports.cioBuscaAtivaJson = functions
    .runWith({timeoutSeconds: 540, memory: "512MB"}).pubsub
    .schedule("30 13 * * 1-5")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou cioBuscaAtivaJson");
      const promises = [];
      let monthEnvio;
      let dayEnvio;
      let dataEnvio;
      let yearEnvio;
      let sendDate;
      const today = new Date();
      const todayDate = today.getDate()+"/"+(today.getMonth()+1)+"/"+
      today.getFullYear();
      const db = admin.database();
      db.ref(buscaAtivaEmpresa + "/buscaAtiva/aEnviarOnWrite").set(true);

      try {
        return sqlConnection.connect(cioSqlConfig).then((pool) => {
          console.log("Entrou connect");
          let queryAgendados = "";

          queryAgendados = "SELECT CodPaciente, Paciente, Convenio, ";
          queryAgendados = queryAgendados + "Medico ";
          queryAgendados = queryAgendados + "FROM dbo.vw_Excel_";
          queryAgendados = queryAgendados +"Age_Marcacao";
          queryAgendados = queryAgendados + "_Pacientes_Agendados ";
          queryAgendados = queryAgendados +"WHERE CodPaciente ";
          queryAgendados = queryAgendados +"IS NOT NULL";

          let queryUltimoAno = "";
          queryUltimoAno = "SELECT CodPaciente, Paciente, Convenio, ";
          queryUltimoAno = queryUltimoAno + "Medico, Telefone, ";
          queryUltimoAno = queryUltimoAno + "IDItem, Item ";
          queryUltimoAno = queryUltimoAno + "FROM dbo.vw_Excel";
          queryUltimoAno = queryUltimoAno + "_Sis_Atendimento";
          queryUltimoAno = queryUltimoAno + "_Pacientes_Ult_Ano_Ciom";
          queryUltimoAno = queryUltimoAno + " WHERE CodPaciente ";
          queryUltimoAno = queryUltimoAno + "IS NOT NULL";

          const queries = queryAgendados + ";" +
          queryUltimoAno;
          // console.log("queries: " + queries);
          promises.push(pool.request().query(queries));
          promises.push(db.ref(buscaAtivaEmpresa +
                "/buscaAtiva/pacientesCompleto/").once("value"));
          promises.push(db.ref(buscaAtivaEmpresa +
                "/buscaAtiva/enviados/").once("value"));
          promises.push(db.ref(
              buscaAtivaEmpresa + "/buscaAtiva/configuracoes/quantidadeEnvio/")
              .once("value"));
          promises.push(cioCanceladosAll());
          return Promise.all(promises).then((res) => {
            console.log("Entrou Promise");
            // Armazenamento leitura dos DB
            const agendados = res[0].recordsets[0];
            const ultimoAno = res[0].recordsets[1];
            const aEnviar = res[1].val();
            const enviados = res[2].val();
            const quantidadeEnvio = res[3].val();
            const cancelados = res[4];

            console.log("Agendados: " + JSON.stringify(agendados));

            // Processamento dos Enviados
            // Remoção de pacientes enviados há mais de 1 mês
            const entriesEnviados = Object.entries(enviados);
            const entriesAEnviar = Object.entries(aEnviar);
            // const entriesCancelados = Object.entries(cancelados);
            const enviadosFiltrado = {};
            let countEnviadosFiltrado = 0;
            // Cancelados
            // console.log("CanceladosAll: "+JSON.stringify(cancelados));
            // Retirar enviados há mais de um mês
            entriesEnviados.forEach((element) => {
              dataEnvio = element[1].DataEnvio;
              dayEnvio = dataEnvio.split("/")[0];
              monthEnvio = dataEnvio.split("/")[1];
              yearEnvio = dataEnvio.split("/")[2];
              sendDate = new Date(monthEnvio+"/"+
                dayEnvio+"/"+yearEnvio);
              sendDate.setDate(sendDate.getDate()+30);
              if (sendDate>today) {
                countEnviadosFiltrado+=1;
                enviadosFiltrado[element[0]] = element[1];
              }
            });
            console.log("Passou For Each Enviados");

            // Filtrando a Enviar
            const entriesEnviadosFiltrados = Object.entries(enviadosFiltrado);
            let count = 0;
            let countLidos = 0;
            let countAgendados = 0;
            let countUltimoAno = 0;
            let countEnviados = 0;
            let countCancelados = 0;

            const dataAtualAux = new Date();
            const dataAtual = JSON.stringify(dataAtualAux);

            // Lê entriesAEnviar do fim pro inicio
            entriesAEnviar.slice().reverse().forEach((pacAEnviar)=>{
              countLidos+=1;
              if (count<quantidadeEnvio) {
                // agendados
                if (agendados.some((pacAgendado) =>
                  pacAgendado.CodPaciente==pacAEnviar[1].CodPaciente)) {
                  countAgendados+=1;
                  // console.log("agendado " + pacAEnviar[1].Paciente);

                // ultimo ano
                } else if (ultimoAno.some((pacUltimoAno) =>
                  pacUltimoAno.CodPaciente==pacAEnviar[1].CodPaciente)) {
                  countUltimoAno+=1;
                  // console.log("ultimo ano " + pacAEnviar[1].Paciente);

                // enviados
                } else if (entriesEnviadosFiltrados.some((pacEnviado) =>
                  pacEnviado[1].CodPaciente==pacAEnviar[1].CodPaciente)) {
                  countEnviados+=1;
                  // console.log("ja enviado " + pacAEnviar[1].Paciente);

                // cancelados
                } else {
                  let cancelou = false;
                  const whatsApp = tel2Whats(pacAEnviar[1].Telefone)
                      .substring(2, 13);
                  if (cancelados[whatsApp]) {
                    const pacCanc = cancelados[whatsApp];
                    if ((pacCanc.Reenviar.toString() == "") ||
                      (JSON.stringify(pacCanc.Reenviar) > dataAtual)) {
                      cancelou = true;
                    } else {
                      // db.ref("OFT/45/buscaAtiva/ Cancelados/" +
                      // whatsApp).set(null);
                      db.ref(buscaAtivaEmpresa +
                        "/_dadosComuns/cancelados/automatico/" +
                      whatsApp).set(null);
                      db.ref(buscaAtivaEmpresa + "/_dadosComuns/cancelados/" +
                      "1Wb8t8_Co2Z5MGAtHYHZo6Q7o0GqianCF2fH2-gm0d6g" +
                      "/Cancelados/" + whatsApp).set(null);
                    }
                  }
                  if (cancelou) {
                    countCancelados+=1;

                  // enviar
                  } else {
                    // console.log("enviou " + pacAEnviar[1].Paciente);
                    db.ref(buscaAtivaEmpresa + "/buscaAtiva/aEnviarOnWrite")
                        .push(pacAEnviar[1]);
                    pacAEnviar[1].DataEnvio = todayDate;
                    enviadosFiltrado[pacAEnviar[0]] = pacAEnviar[1];
                    count+=1;
                  }
                }
              }
            });
            console.log("Cancelados: " + countCancelados);
            console.log("Ja enviados no ultimo mes: " + countEnviados);
            console.log("Ultimo Ano: " + countUltimoAno);
            console.log("Agendados: " + countAgendados);
            console.log("Enviados Filtrado: " + countEnviadosFiltrado);
            console.log("Lidos: " + countLidos);
            console.log("Enviados com sucesso: " + count);

            // não salvar no nó
            if (ambiente === "producao") {
              db.ref(buscaAtivaEmpresa + "/buscaAtiva/enviados").
                  set(enviadosFiltrado);
            }
            const msgConfirmacao = `FUNCTION EXECUTADA COM SUCESSO!
            \n*nome*: cioBuscaAtivaJson`;
            enviarMensagemWhatsApp("5521971938840", msgConfirmacao, "cio");

            // resp.end("Ok"+resp.status.toString());
            return null;
          });
        });
      } catch (err) {
        // ... error checks
        console.log("Erro try: " + JSON.stringify(err));
      }
    });


exports.cioBuscaAtivaZApi =
functions.database.ref(buscaAtivaEmpresa +
    "/buscaAtiva/aEnviarOnWrite/{pushId}")
    .onWrite((change, context) => {
      console.log("Entrou cioBuscaAtivaZApi");
      // Only edit data when it is first created.
      // if (change.before.exists()) {
      // return null;
      // }
      // Exit when the data is deleted.
      if (!change.after.exists()) {
        return null;
      }
      // const db = admin.database();
      // Grab the current value of what was written to the Realtime Database
      const element = change.after.val();
      console.log(JSON.stringify(element));

      let paciente = "";
      if (element.Paciente) {
        paciente = element.Paciente;
      }
      let whatsAppCel;
      if (element.Telefone) {
        whatsAppCel = tel2Whats(element.Telefone);
      }
      let codPaciente = "";
      if (element.Paciente) {
        codPaciente = element.CodPaciente;
      }
      let convenio = "";
      if (element.Convenio) {
        convenio = element.Convenio;
      }
      let dataAtendimento = "";
      if (element.DataAtendimento) {
        dataAtendimento = element.DataAtendimento;
        dataAtendimento = dataAtendimento.split("T")[0];
        const dia = dataAtendimento.split("-")[2];
        const mes = dataAtendimento.split("-")[1];
        const ano = dataAtendimento.split("-")[0];
        dataAtendimento = dia +"/"+ mes +"/"+ ano;
      }
      let medico = "";
      if (element.Medico) {
        medico = element.Medico;
      }
      let item = "";
      if (element.Item) {
        item = element.Item;
      }
      // const message1Aux = whatsAppCel;
      if (ambiente == "teste") whatsAppCel = "5521971938840";

      // #OptionList
      const optionList = {
        // "title": "Opções disponíveis",
        "buttonLabel": "Clique aqui para responder",
        "options": [
          {
            "id": "BSCATVCIO-AGDCONS",
            "title": "Sim, gostaria de agendar uma consulta",
            // "description": "Gostei muito do resultado da cirurgia",
          },
          {
            "id": "BSCATVCIO-LMBRFUT",
            "title": "Lembre-me novamente no futuro",
            // "description": "Gostei parcialmente do resultado da cirurgia",
          },
          {
            "id": "BSCATVCIO-CANCMSG",
            "title": "Não desejo receber mais mensagem",
            // "description": "Não gostei do resultado da cirurgia",
          },
        ],
      };

      if (whatsAppCel) {
        let parametros = {};
        if (ambiente == "teste") {
          parametros = {
            whatsAppCel: whatsAppCel,
            id: "3B74CE9AFF0D20904A9E9E548CC778EF",
            token: "A8F754F1402CAE3625D5D578",
            optionList: optionList,
          };
        } else {
          parametros = {
            whatsAppCel: whatsAppCel,
            id: "3D42001CE801706132BE2286F7004CFC",
            token: "E8E7AB50C4E31DF7C36F8CB1",
            optionList: optionList,
          };
        }

        const message1 = "Boa tarde! Tudo bem? \nAqui é do " +
        "Centro Integrado Oftalmo-Otorrino do Méier" +
        "\n\nVerificamos que " +
        "a última consulta de "+ paciente +" aconteceu há mais de um ano." +
        "\n\nUltimo Atendimento: " + dataAtendimento +
        "\nConvênio: " + convenio +
        "\nTipo da Consulta: " + item +
        "\nMédico: " + medico +
        "\nCodigo: " + codPaciente +
        "\n\n*Gostaria de agendar uma nova consulta?*";


        // if (ambiente === "teste") {
        //   message1 = message1Aux + " > " + paciente +
        //   " -> " + message1;
        // }

        const arrMessage = [{
          "phone": whatsAppCel,
          "message": message1,
        }];

        const i = 0;
        callZapiV3(arrMessage, parametros, i);
      }

      return null;
    });


// **************************************************************
// Função para enviar mensagens via WhatsApp
// **************************************************************
/**
 * @async
 * @function enviarMensagemWhatsApp
 * @param {string} phoneNumber - telefone para enviar a mensagem via WhatsApp.
 * @param {string} message - Mensagem a ser enviada,
 * @param {string} unidade - de qua unidade.
 * @return {Promise<boolean>}
 */
async function enviarMensagemWhatsApp(phoneNumber, message, unidade) {
  let parametros = {};
  if (ambiente == "teste") {
    parametros = {
      id: "3B74CE9AFF0D20904A9E9E548CC778EF",
      token: "A8F754F1402CAE3625D5D578",
    };
  } else {
    if (unidade == "cio") {
      parametros = {
        id: "3D42001CE801706132BE2286F7004CFC",
        token: "E8E7AB50C4E31DF7C36F8CB1",
      };
    } else if (unidade == "usina") {
      parametros = {
        id: "3A87852FD92C60C145272A5EFA8E6022",
        token: "B2FB73CD5A709BD1C2AD96F9",
      };
    } else if (unidade == "oft") {
      parametros = {
        id: "39C7A89881E470CC246252059E828D91",
        token: "B1CA83DE10E84496AECE8028",
      };
    } else if (unidade == "drm") {
      parametros = {
        id: "3D460A6CB6DA10A09FAD12D00F179132",
        token: "1D2897F0A38EEEC81D2F66EE",
      };
    }
  }

  const arrMessage = [{
    "phone": phoneNumber,
    "message": message,
  }];

  const i = 0;
  if (!((ambiente === "teste") && (execucaoFuntions === "emulador"))) {
    callZapiV3(arrMessage, parametros, i);
  }
}


// exports.cioConfirmacaoPacientesJson = functions.https.
//     onRequest((req, resp) => {
exports.cioConfirmacaoPacientesJson = functions.pubsub
    .schedule("00 07 * * *")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou Função cioConfirmacaoPacientesJson");
      const today = new Date();
      const year = today.getFullYear();
      const mm = today.getMonth()+1;
      const dd = today.getDate();
      const diaDaSemana = today.getDay();
      if (diaDaSemana != 0 && diaDaSemana != 6 ) {
        try {
          // make sure that any items are correctly
          // URL encoded in the connection string
          // console.log("Entrou try");
          return sqlConnection.connect(cioSqlConfig).then((pool) => {
            // pool.sqlConnection.connect(sqlConfig);
            // console.log("Entrou connect");
            let sql = "";
            if (ambiente == "teste") {
              sql = "SELECT * ";
              sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
              sql = sql + "WHERE  DataMarcada >= '2024-10-07' ";
              sql = sql + "AND  DataMarcada < '2024-10-08' ";
              sql = sql + "ORDER BY DataMarcada";
            } else {
              if (diaDaSemana == 5) {
                sql = "SELECT * ";
                sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
                sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 1 + ",";
                sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
                sql = sql + ",0,0,0,0)) ";
                sql = sql + "AND  DataMarcada < DATEADD(dd," + 4 + ",";
                sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
                sql = sql + ",0,0,0,0)) ";
                sql = sql + "ORDER BY DataMarcada";
              } else {
                sql = "SELECT * ";
                sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
                sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 1 + ",";
                sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
                sql = sql + ",0,0,0,0)) ";
                sql = sql + "AND  DataMarcada < DATEADD(dd," + 2 + ",";
                sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
                sql = sql + ",0,0,0,0)) ";
                sql = sql + "ORDER BY DataMarcada";
              }
            }
            // console.log("PASSOU POR AQUI!");

            return pool.query(sql);
            // const result = pool.query(sql);
          }).then((result) => {
            const db = admin.database();

            const refAEnviar = db.ref("CIO/confirmacaoPacientes/aEnviar");
            refAEnviar.set(null);

            const ref = db.ref("CIO/confirmacaoPacientes/aEnviar");
            result.recordset.forEach((element) => {
              /*
              const year = element.DataMarcada.substring(0, 3);
              const mm = element.DataMarcada.substring(5, 6);
              const dd = element.DataMarcada.substring(8, 9);
              const hh = element.DataMarcada.substring(11, 12);
              const min = element.DataMarcada.substring(14, 15);
              */
              const year = element.DataMarcada.getFullYear();
              const mm = element.DataMarcada.getMonth()+1;
              const dd = element.DataMarcada.getDate();
              const hh = element.DataMarcada.getHours();
              let min = element.DataMarcada.getMinutes();
              if (min == 0 ) {
                min = "00";
              }
              const dataMarcada = dd + "/" + mm + "/" +
                year + "  " + hh + ":" + min;
              element.DataMarcada = dataMarcada;
              ref.push(element);
            });
            const msgConfirmacao = `FUNCTION EXECUTADA COM SUCESSO!
            \n*nome*: cioConfirmacaoPacientesJson`;
            enviarMensagemWhatsApp("5521971938840", msgConfirmacao, "cio");

            // resp.end("Ok"+resp.status.toString());
            // ref.set(true);
            return null;
          });
        } catch (err) {
          // ... error checks
          console.log("Erro try: " + JSON.stringify(err));
        }
      }
    });


exports.cioConfirmacaoPacientesZApi =
  functions.database.ref("CIO/confirmacaoPacientes/aEnviar/{pushId}")
      .onWrite((change, context) => {
        // Only edit data when it is first created.
        // if (change.before.exists()) {
        // return null;
        // }
        // Exit when the data is deleted.
        if (!change.after.exists()) {
          return null;
        }
        const db = admin.database();
        // const pushID = context.params.pushId;
        // const refAEnviar = db.ref("CIO/confirmacaoPacientes/aEnviar/" +
        //   pushID);
        // refAEnviar.set(null);

        // Grab the current value of what was written to the Realtime Database
        const element = change.after.val();
        console.log(JSON.stringify(element));
        const endereco = "Rua Hermengarda, 428 - Meier";
        const empresa = "CIOM Oftalmologia, Otorrino e Alergologia";
        // console.log("forEach. element:" + JSON.stringify(element));
        let paciente = "";
        let dataMarcada = "";
        let medico = "";
        let convenio = "";
        let whatsAppCel = "";
        let IDMarcacao = "";
        if (element.Paciente) {
          paciente = element.Paciente;
        }
        if (element.DataMarcada) {
          dataMarcada = element.DataMarcada;
        }
        if (element.Medico) {
          medico = element.Medico;
        }
        if (element.Convenio) {
          convenio = element.Convenio;
        }

        if (element.IDMarcacao) {
          IDMarcacao = element.IDMarcacao;
        }

        let Telefone = "";
        let TelefoneCel = "";
        let TelefoneCom = "";
        let TelefoneRes = "";


        if (element.Telefone) {
          Telefone = tel2Whats(element.Telefone);
          console.log("Telefone: " + Telefone);
        }
        if (element.TelefoneCel) {
          TelefoneCel = tel2Whats(element.TelefoneCel);
          console.log("TelefoneCel: " + TelefoneCel);
        }
        if (element.TelefoneRes) {
          TelefoneRes = tel2Whats(element.TelefoneRes);
          console.log("TelefoneRes: " + TelefoneRes);
        }
        if (element.TelefoneCom) {
          TelefoneCom = tel2Whats(element.TelefoneCom);
          console.log("TelefoneCom: " + TelefoneCom);
        }

        if (Telefone != "") {
          whatsAppCel = Telefone;
        } else if (TelefoneCel != "") {
          whatsAppCel = TelefoneCel;
        } else if (TelefoneRes!= "") {
          whatsAppCel = TelefoneRes;
        } else if (TelefoneCom != "") {
          whatsAppCel = TelefoneCom;
        }

        console.log("whatsAppCel: " + whatsAppCel);
        if (medico != medicoAusente &&
            medico != medicoAusente2 &&
            medico != medicoAusente3) {
          if (whatsAppCel) {
            // dd/mm/yyyy hh:mm
            // const year = dataMarcada.split("/")[2].split(" ")[0];
            // const mm = dataMarcada.split("/")[1];
            // const dd = dataMarcada.split("/")[0];
            // const hh = dataMarcada.substring(9, 10);
            // const min = dataMarcada.substring(12, 13);

            if (convenio == "Particular Oft") convenio = "Particular";

            let message1 = "";
            message1 = "Olá! Aqui é da "+ empresa +"." +
            "\n\nGostaríamos de confirmar o agendamento abaixo:" +
            "\n*Paciente:* " + paciente +
            "\n*Data/Hora:* " + dataMarcada +
            "\n*Médico:* " + medico +
            "\n*Plano:* " + convenio +
            "\n*Endereço:* " + endereco +
            "\n\n*CONFIRMA*?";

            if (ambiente == "teste") {
              message1 = whatsAppCel + "\n\n" + message1;
            }

            const optionList = {
              // "title": "Opções disponíveis",
              "buttonLabel": "Clique aqui para responder",
              "options": [
                {
                  "id": "CNFSIM-" + IDMarcacao,
                  "title": "Confirmar",
                  // "description": "Z-API Asas para sua imaginação",
                },
                {
                  "id": "CNFNAO-" + IDMarcacao,
                  "title": "Cancelar",
                  // "description": "Não funcionam",
                },
              ],
            };

            if (ambiente == "teste") whatsAppCel = "5521971938840"; // gabriel

            if (whatsAppCel) {
              let parametros = {};
              if (ambiente == "teste") {
                parametros = {
                  whatsAppCel: whatsAppCel,
                  id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                  token: "A8F754F1402CAE3625D5D578",
                  optionList: optionList,
                };
              } else {
                parametros = {
                  whatsAppCel: whatsAppCel,
                  id: "3D42001CE801706132BE2286F7004CFC",
                  token: "E8E7AB50C4E31DF7C36F8CB1",
                  optionList: optionList,
                };
              }
              const arrUrls = [message1];
              const arrMessageType = ["text"];
              const i = 0;
              callZapiV2(arrUrls, arrMessageType, parametros, i);
            }
          }
          return null;
        } else {
          const pushID = context.params.pushId;
          const refAEnviar = db.ref("CIO/confirmacaoPacientes/aEnviar/" +
              pushID);
          refAEnviar.set(null);
        }
      });
// ------------------------------------------------------------
// exports.cioPesquisaSatisfacaoJson = functions.https.
//     onRequest((req, resp) => {
exports.cioPesquisaSatisfacaoJson = functions.pubsub
    .schedule("30 07 * * *")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou Função cioPesquisaSatisfacaoJson");
      const today = new Date();
      const year = today.getFullYear();
      const mm = today.getMonth()+1;
      const dd = today.getDate();
      let contWhatsApp = 0;
      // const diaDaSemana = today.getDay();
      try {
        return sqlConnection.connect(cioSqlConfig).then((pool) => {
          let sql = "";
          if (ambiente == "teste") {
            sql = "SELECT * ";
            // sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
            // sql = sql + "WHERE  IDAtendimento IS NOT NULL ";
            sql = sql + "FROM dbo.vw_Excel_Sis_Atendimento";
            sql = sql + "_Busca_Ativa_Ciom ";
            sql = sql + "WHERE  DataAtendimento >= '2025-03-21' ";
            sql = sql + "AND  DataAtendimento < '2025-03-22' ";
            sql = sql + "ORDER BY DataAtendimento, Paciente";
          } else {
            sql = "SELECT * ";
            // sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
            sql = sql + "FROM dbo.vw_Excel_Sis_Atendimento";
            sql = sql + "_Busca_Ativa_Ciom ";
            // sql = sql + "WHERE  IDAtendimento IS NOT NULL ";
            sql = sql + "WHERE  DataAtendimento < DATEADD(dd," + 0 + ",";
            sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)) ";
            sql = sql + "AND  DataAtendimento >= DATEADD(dd," + -1 + ",";
            sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)) ";
            sql = sql + "ORDER BY DataAtendimento, Paciente";
          }
          return pool.query(sql);
          // const result = pool.query(sql);
        }).then((result) => {
          const db = admin.database();
          const ref = db.ref("CIO/pesquisaSatisfacao/aEnviar");
          ref.set(null);

          console.log(JSON.stringify(result.recordset[0]));
          console.log(JSON.stringify(result));
          result.recordset.forEach((element) => {
            // if (contWhatsApp < 5) {
            //
            const year = element.DataAtendimento.getFullYear();
            const mm = element.DataAtendimento.getMonth()+1;
            const dd = element.DataAtendimento.getDate();
            const hh = element.DataAtendimento.getHours();
            let min = element.DataAtendimento.getMinutes();
            if (min == 0 ) {
              min = "00";
            }
            const DataAtendimento = dd + "/" + mm + "/" +
              year + "  " + hh + ":" + min;
            element.DataAtendimento = DataAtendimento;
            ref.push(element);
            contWhatsApp = contWhatsApp + 1;
            // }
          });
          const msgConfirmacao = `FUNCTION EXECUTADA COM SUCESSO!
          \n*nome*: cioPesquisaSatisfacaoJson`;
          enviarMensagemWhatsApp("5521971938840", msgConfirmacao, "cio");

          // resp.end("Ok"+ resp.status.toString() +
          // "\n\nmensagens lidas: " + contWhatsApp);
          // ref.set(true);
          return null;
        });
      } catch (err) {
        // ... error checks
        console.log("Erro try: " + JSON.stringify(err));
      }
    });


exports.cioPesquisaSatisfacaoZApi =
  functions.database.ref("CIO/pesquisaSatisfacao/aEnviar/{pushId}")
      .onWrite((change, context) => {
        // Only edit data when it is first created.
        // if (change.before.exists()) {
        // return null;
        // }
        // Exit when the data is deleted.
        if (!change.after.exists()) {
          return null;
        }
        // Grab the current value of what was written to the Realtime Database
        const element = change.after.val();
        console.log(JSON.stringify(element));

        let paciente = "";

        if (element.Paciente) {
          paciente = element.Paciente;
        }
        let whatsAppCel = "";
        let Telefone = "";
        // let TelefoneCel = "";
        // let TelefoneCom = "";
        // let TelefoneRes = "";

        if (element.Telefone) {
          Telefone = tel2Whats(element.Telefone);
          console.log("Telefone: " + Telefone);
        }
        // if (element.TelefoneCel) {
        //   TelefoneCel = tel2Whats(element.TelefoneCel);
        //   console.log("TelefoneCel: " + TelefoneCel);
        // }
        // if (element.TelefoneRes) {
        //   TelefoneRes = tel2Whats(element.TelefoneRes);
        //   console.log("TelefoneRes: " + TelefoneRes);
        // }
        // if (element.TelefoneCom) {
        //   TelefoneCom = tel2Whats(element.TelefoneCom);
        //   console.log("TelefoneCom: " + TelefoneCom);
        // }

        if (Telefone != "") {
          whatsAppCel = Telefone;
        }
        // } else if (TelefoneCel != "") {
        //   whatsAppCel = TelefoneCel;
        // } else if (TelefoneRes!= "") {
        //   whatsAppCel = TelefoneRes;
        // } else if (TelefoneCom != "") {
        //   whatsAppCel = TelefoneCom;
        // }

        // console.log("whatsAppCel: " + whatsAppCel);
        if (whatsAppCel) {
          //
          let message1 = "Olá! Aqui é da CIOM " +
          "Oftalmologia, Otorrino e Alergologia." +
          "\n\nObrigado por nos escolher para o atendimento de " +
          paciente + "." +
          "\n\nPara que possamos melhorar ainda mais, por favor clique " +
          "no link, avalie-nos no Google e deixe um comentário " +
          "(leva em média 1 minuto). " +
          "\n\nSua opinião é muito importante para nós! " +
          "\n\n   https://g.page/r/Cb7K4cqcSNc6EAE/review " +
          "\n\nObrigado e até a próxima consulta.";

          if (ambiente == "teste") {
            message1 = whatsAppCel + "\n\n" + message1;
          }

          if (ambiente == "teste") whatsAppCel = "5521971938840"; // gabriel

          if (whatsAppCel) {
            let parametros = {};
            if (ambiente == "teste") {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                token: "A8F754F1402CAE3625D5D578",
                // optionList: optionList,
              };
            } else {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "3D42001CE801706132BE2286F7004CFC",
                token: "E8E7AB50C4E31DF7C36F8CB1",
                // optionList: optionList,
              };
            }
            const arrMessage = [{
              "phone": whatsAppCel,
              "message": message1,
            }];
            const i = 0;
            callZapiV3(arrMessage, parametros, i);
          }
        }
        return null;
      });
// ============================================================

exports.cioMensagemRecebidaZApiWH = functions.https.
    onRequest((req, resp) => {
      cors(req, resp, () => {
        cioSqlConfig = {
          user: functions.config().sqlserver.usuario,
          password: functions.config().sqlserver.senha,
          database: "ASADB",
          server: "ciomoi.ddns.net",
          port: 8282,
          pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 3000000,
          },
          options: {
            database: "ASADB",
            encrypt: false, // for azure
            trustServerCertificate: true,
            // change to true for local dev / self-signed certs
          },
        };
        let sendMsg = "";
        let optionList = {};
        // let postData = "";
        let dadosCancelar = {};
        let receivedID = "";
        const db = admin.database();

        // LIST
        // console.log("list ID -> " + JSON.stringify(req.body
        //     .listResponseMessage.selectedRowId));
        if (req.body.listResponseMessage) {
          if (req.body.listResponseMessage.selectedRowId) {
            receivedID = req.body.listResponseMessage.selectedRowId;
          }
        } else {
          console.log("finalizou no else req.body.listResponseMessage!");
          resp.status(200).end();
        }

        const whatsAppCel = req.body.phone.substring(2, 13);
        const IDMarcacao = receivedID.split(/-/g)[1];

        // chave ID
        console.log("\nchave ID -> "+ receivedID + "\n");

        // console.log(emoji.find("📞"));
        // console.log(emoji.find("🗓️"));
        // console.log(emoji.find("👋"));

        const emojiUse1 = emoji.get("wave"); // 👋
        // const emojiUse2 = emoji.get("spiral_calendar"); // 🗓️
        const emojiUse3 = emoji.get("telephone_receiver"); // 📞

        // const emojiUse3 = emoji.get("wink"); // 😉

        // CioBuscaAtiva
        if (receivedID.match(/BSCATVCIO/g)) {
          if (receivedID.match(/BSCATVCIO-AGDCONS/g)) {
            console.log("Entrou if BSCATVCIO-AGDCONS");
            sendMsg = emojiUse3 + " Em breve " +
              "entreremos em contato com você por aqui para agendar a consulta";
          }

          if (receivedID.match(/BSCATVCIO-LMBRFUT/g)) {
            console.log("Entrou if BSCATVCIO-LMBRFUT");
            sendMsg = "Quando deseja ser lembrado novamente?";

            optionList = {
              // "title": "Opções disponíveis",
              "buttonLabel": "Clique aqui para responder",
              "options": [
                {
                  "id": "BSCATVCIO-LMBR2MESES",
                  "title": "Lembrar daqui a 2 meses",
                  // "description": emojiUse2 +
                  //             " Daqui a dois meses entraremos em contato",
                },
                {
                  "id": "BSCATVCIO-LMBR4MESES",
                  "title": "Lembrar daqui a 4 meses",
                  // "description": emojiUse2 +
                  //                " Daqui a quatro meses lhe lembraremos",
                },
                {
                  "id": "BSCATVCIO-LMBR6MESES",
                  "title": "Lembrar daqui a 6 meses",
                  // "description": emojiUse2 +
                  //                   " Daqui a seis meses lhe lembraremos",
                },
              ],
            };
          }
          if (receivedID.match(/BSCATVCIO-CANCMSG/g)) {
            console.log("Entrou if BSCATVCIO-CANCMSG");
            sendMsg = "OK, sem problemas."+
            "\n\nPoderia nos informar o motivo do cancelamento?";

            dadosCancelar = {
              Reenviar: "",
            };
            db.ref("CIO/_dadosComuns/cancelados/automatico/" +
                whatsAppCel).set(dadosCancelar);
          }


          if (receivedID.match(/BSCATVCIO-LMBR2MESES/g)) {
            console.log("Entrou if BSCATVCIO-LMBR2MESES");
            sendMsg = "OK. Daqui a 2 meses entraremos em contato novamente. " +
                    "\nObrigado e até breve " + emojiUse1;


            const dataReenviar = new Date();
            dataReenviar.setDate(dataReenviar.getDate() + 60);

            dadosCancelar = {
              Reenviar: JSON.parse(JSON.stringify(dataReenviar)),
            };

            db.ref("CIO/_dadosComuns/cancelados/automatico/" +
            whatsAppCel).set(dadosCancelar);
          }

          if (receivedID.match(/BSCATVCIO-LMBR4MESES/g)) {
            console.log("Entrou if BSCATVCIO-LMBR4MESES");
            sendMsg = "OK. Daqui a 4 meses entraremos em contato novamente. " +
                    "\nObrigado e até breve " + emojiUse1;

            const dataReenviar = new Date();
            dataReenviar.setDate(dataReenviar.getDate() + 120);

            dadosCancelar = {
              Reenviar: JSON.parse(JSON.stringify(dataReenviar)),
            };

            db.ref("CIO/_dadosComuns/cancelados/automatico/" +
            whatsAppCel).set(dadosCancelar);
          }

          if (receivedID.match(/BSCATVCIO-LMBR6MESES/g)) {
            console.log("Entrou if BSCATVCIO-LMBR6MESES");
            sendMsg = "OK. Daqui a 6 meses entraremos em contato novamente. " +
                      "\nObrigado e até breve " + emojiUse1;

            const dataReenviar = new Date();
            dataReenviar.setDate(dataReenviar.getDate() + 180);

            dadosCancelar = {
              Reenviar: JSON.parse(JSON.stringify(dataReenviar)),
            };

            db.ref("CIO/_dadosComuns/cancelados/automatico/" +
            whatsAppCel).set(dadosCancelar);
          }

          // Confirmação
        } else if (receivedID.match(/CNFSIM/g)||receivedID.match(/CNFNAO/g)) {
          let novaObs = "";
          console.log("Entrou no if CNFSIM CNFNAO");
          if (receivedID.match(/CNFSIM/g)) {
            console.log("Entrou no if CNFSIM");
            novaObs = "PACIENTE CONFIRMADO";
            sendMsg = "Ótimo! Consulta confirmada!" +
              "\n\nAlgumas recomendações importantes:" +
              "\n- É necessário apresentar carteira de identidade, " +
              "e carteira do plano de saúde (fisica/digital)." +
              "\n- Para a realização do seu exame favor trazer " +
              "o pedido original datado e assinado." +
              "\n- Para atendimento oftamológico, " +
              "retire suas lentes de contato 24 horas " +
              "(lentes gelatinosas) ou 48 horas (lentes duras) " +
              "antes do exame ou da sua consulta!" +
              "\n- Favor chegar com 15 min de antecedência." +
              // "\n\nPara agilizar seu atendimento, *caso ainda não " +
              // "seja cadastrado*, preencha seus " +
              // "dados cadastrais acessando o link" +
              // "\n https://form.typeform.com/to/DfmE0u0K#idmarcacao=" +
              // // IDMarcacao +
              // "\n(caso não funcione, copie o endereço acima " +
              // "e cole no navegador Google Chrome)." +
              "\n\nQualquer dúvida, pode nos chamar por aqui.";
          } else if (receivedID.match(/CNFNAO/g)) {
            const emojiUse1 = emoji.get("pleading"); // 🥺

            // // COMO ACHAR EMOJI NO NODE
            // console.log(emoji.find("🥺"));

            novaObs = "PACIENTE CANCELADO";
            sendMsg = "Poxa! É uma pena!!! " + emojiUse1 +
            "\nGostaria de reagendar a consulta?";
          }
          try {
            console.log("Entrou Try");
            sqlConnection.connect(cioSqlConfig).then((pool) => {
              let sql = "";
              sql = "SELECT Observacao ";
              sql = sql + "FROM dbo.Age_Marcacao ";
              sql = sql + "WHERE IDMarcacao = " + IDMarcacao;
              return pool.query(sql);
            }).then((result) => {
              console.log("Entrou no then result");
              const obsOld = result.recordset[0].Observacao;
              let sql2 = "";
              if (obsOld) {
                sql2 = "UPDATE dbo.Age_Marcacao ";
                sql2 = sql2 + "SET Observacao = '" + obsOld;
                sql2 = sql2 + ". " + novaObs + ".' ";
                sql2 = sql2 + "WHERE IDMarcacao = " + IDMarcacao;
              } else {
                sql2 = "UPDATE dbo.Age_Marcacao ";
                sql2 = sql2 + "SET Observacao = '" + novaObs + ".' ";
                sql2 = sql2 + "WHERE IDMarcacao = " + IDMarcacao;
              }
              const ReqASA = new sqlConnection.Request();
              ReqASA.query(sql2);
            });
          } catch (err) {
            // ... error checks
            console.log("Erro try: " + JSON.stringify(err));
          }
          console.log(novaObs);
        } else {
          resp.end();
          return;
        }
        console.log("Vai entrar no if sendMsg: " + sendMsg);
        if (sendMsg) {
          if (whatsAppCel) {
            console.log("Entrou no if whatsAppCel");
            let parametros = {};
            if (ambiente == "teste") {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                token: "A8F754F1402CAE3625D5D578",
                optionList: optionList,
              };
            } else {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "3D42001CE801706132BE2286F7004CFC",
                token: "E8E7AB50C4E31DF7C36F8CB1",
                optionList: optionList,
              };
            }

            const arrMessage = [{
              "phone": whatsAppCel,
              "message": sendMsg,
            }];

            const i = 0;
            callZapiV3(arrMessage, parametros, i);
          }
        }
        console.log("finalizou!");
        resp.status(200).end();
      });
    });


// exports.oft45BuscaAtivaCargaMensal = functions.
//     runWith({timeoutSeconds: 540}).https.
//     onRequest((req, resp) => {
exports.oft45BuscaAtivaCargaMensal = functions
    .runWith({timeoutSeconds: 540}).pubsub
    .schedule("31 17 * * *")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("ENTROU oft45BuscaAtivaCargaMensal");
      const dbRef = admin.database();

      console.log("VAI ENTRAR NO DBREF");
      return dbRef.ref("OFT/45/buscaAtiva/pacientesCompleto").set(null)
          .then(() => {
            console.log("ENTROU NO DBREF");
            try {
              return sqlConnection.connect(sqlConfig).then((pool) => {
                console.log("ENTROU NO QUERY");
                let queryBuscaAtiva = "";
                queryBuscaAtiva = "SELECT * FROM dbo.vw_Excel_Sis_Atendimento";
                queryBuscaAtiva = queryBuscaAtiva + "_Busca_Ativa_45 ";
                queryBuscaAtiva = queryBuscaAtiva + "ORDER BY DataAtendimento";

                // return pool.request()
                // .query(queryBuscaAtiva, (err, result) => {
                return pool.query(queryBuscaAtiva);
                // const result = pool.query(sql);
              }).then((result) => {
                console.log("ENTROU NA ARRUMAÇÂO DO QUERY");
                let codPac = "";
                // let strPar = "{";
                const buscaAtivaJson = {};
                result.recordset.forEach((element) => {
                  if (element.CodPaciente && element.Telefone &&
                    tel2Whats(element.Telefone)) {
                    codPac = "codPac_"+element.CodPaciente+"_"+
                      tel2Whats(element.Telefone);
                    // strPar += codPac+":"+JSON.stringify(element)+",";
                    const strData = JSON.stringify(element.DataAtendimento);
                    element.DataAtendimento = JSON.parse(strData);
                    buscaAtivaJson[codPac] = element;
                    // console.log("ENTROU NO FOR EACH");
                  }
                });
                // strPar = strPar.slice(0, -1) + "}";
                // console.log(strPar);
                // const buscaAtivaJson = JSON.parse(strPar);

                console.log("vai escrever no nó pacientes Completos");
                console.log("->" + JSON.stringify(buscaAtivaJson[codPac]));
                dbRef.ref("OFT/45/buscaAtiva/pacientesCompleto")
                    .set(buscaAtivaJson);
                console.log("ESCREVEU no nó pacientes Completos");

                // resp.end("Ok"+resp.status.toString());
                return null;
              });
            } catch (err) {
            // ... error checks
              console.log("Erro try: " + JSON.stringify(err));
            }
          });
    });

/**
 * Lê um arquivo JSON local e grava no Realtime DB completo.
 * @param {string} localASalvar Onde o arquivo vai ser salvo no realtime
 * @param {string} nomeArquivo Nome do arquivo salva na área de trabalho
 */
// async function importarJsonCompletoEmulador(localASalvar, nomeArquivo) {
//   console.log("Entrou importarJsonCompletoEmulador");

//   const db = admin.database();
//   const filePath = path.join(
//       "C:", "Users", "Master", "OneDrive", "Área de Trabalho",
//       nomeArquivo);

//   try {
//     const fileContent = fs.readFileSync(filePath, "utf8");
//     const jsonData = JSON.parse(fileContent);
//     await db.ref(localASalvar).set(jsonData);
//   } catch (fileError) {
//     console.error("Erro ao carregar o arquivo JSON:", fileError);
//     return;
//   }
// }

/**
 * Verifica se a data de hoje é data bloqueada.
 * @return {Promise<boolean>}  true = HOJE está bloqueado
 */
async function oft45DateBlocked() {
  console.log("Entrou oft45DateBlocked");
  const hojeISO = new Date().toISOString().slice(0, 10); // ex.: "2025-06-04"
  const db = admin.database();

  const feriadosSnap = await db
      .ref("/OFT/45/_dadosComuns/diasBloqueados/" +
      "1uBZILvSzwlKlzJhbSyghe9I_6MU-mUID8KQf0oE4WHw/diasBloqueados")
      .once("value");
  const feriadosObj = feriadosSnap.val() || {};

  const bloqueados = Object.values(feriadosObj)
      .some((f) => f.data && f.data.startsWith(hojeISO));

  console.log("bloqueados:", bloqueados);
  return bloqueados;
}

// exports.oft45BuscaAtivaJson = functions.runWith({timeoutSeconds: 540}).https
//     .onRequest(async (req, resp) => {
exports.oft45BuscaAtivaJson = functions
    .runWith({timeoutSeconds: 540}).pubsub
    .schedule("00 16 * * 5")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun(async (context) => {
      console.log("Entrou oft45BuscaAtivaJson");

      // if (local === "emulador") {
      //   const localASalvar = "/OFT/45/buscaAtiva";
      //   const nomeArquivo = "buscaAtiva.json";
      //   importarJsonCompletoEmulador(localASalvar, nomeArquivo);
      // }

      const promises = [];
      let monthEnvio;
      let dayEnvio;
      let dataEnvio;
      let yearEnvio;
      let sendDate;
      const today = new Date();
      const todayDate = today.getDate()+"/"+(today.getMonth()+1)+"/"+
      today.getFullYear();
      const db = admin.database();

      const bloqueado = await oft45DateBlocked();
      console.log("bloqueado:", bloqueado);

      if (bloqueado) {
        console.log("Mensagem NÃO enviada: hoje " +
              "é feriado ou data bloqueada");

        // resp.end("Mensagem NAO enviada: hoje " +
        //       "e feriado ou data bloqueada");
        return null;
      } else {
        console.log("Mensagem ENVIADA: hoje " +
              "NÃO é feriado ou data bloqueada");
      }

      db.ref("OFT/45/buscaAtiva/aEnviarOnWrite").set(true);

      try {
        return sqlConnection.connect(sqlConfig).then((pool) => {
          console.log("Entrou connect");
          let queryAgendados = "";

          queryAgendados = "SELECT CodPaciente, Paciente, Convenio, ";
          queryAgendados = queryAgendados + "Medico ";
          queryAgendados = queryAgendados + "FROM dbo.vw_Excel_";
          queryAgendados = queryAgendados +"Age_Marcacao";
          queryAgendados = queryAgendados + "_Pacientes_Agendados ";
          queryAgendados = queryAgendados +"WHERE CodPaciente ";
          queryAgendados = queryAgendados +"IS NOT NULL";

          let queryUltimoAno = "";
          queryUltimoAno = "SELECT CodPaciente, Paciente, Convenio, ";
          queryUltimoAno = queryUltimoAno + "Medico, Telefone, ";
          queryUltimoAno = queryUltimoAno + "IDItem, Item ";
          queryUltimoAno = queryUltimoAno + "FROM dbo.vw_Excel";
          queryUltimoAno = queryUltimoAno + "_Sis_Atendimento";
          queryUltimoAno = queryUltimoAno + "_Pacientes_Ult_Ano_45";
          queryUltimoAno = queryUltimoAno + " WHERE CodPaciente ";
          queryUltimoAno = queryUltimoAno + "IS NOT NULL";

          const queries = queryAgendados + ";" +
          queryUltimoAno;
          // console.log("queries: " + queries);
          promises.push(pool.request().query(queries));
          promises.push(db.ref("OFT/45/buscaAtiva/pacientesCompleto/")
              .once("value"));
          promises.push(db.ref("OFT/45/buscaAtiva/enviados/").once("value"));
          promises.push(db.ref(
              "OFT/45/buscaAtiva/configuracoes/quantidadeEnvio/").
              once("value"));
          promises.push(oft45CanceladosAll());
          return Promise.all(promises).then((res) => {
            console.log("Entrou Promise");
            // Armazenamento leitura dos DB
            const agendados = res[0].recordsets[0];
            const ultimoAno = res[0].recordsets[1];
            const aEnviar = res[1].val();
            const enviados = res[2].val();
            let quantidadeEnvio = res[3].val();
            const cancelados = res[4];

            // Processamento dos Enviados
            // Remoção de pacientes enviados há mais de 1 mês
            const entriesEnviados = Object.entries(enviados);
            const entriesAEnviar = Object.entries(aEnviar);
            // const entriesCancelados = Object.entries(cancelados);
            const enviadosFiltrado = {};
            let countEnviadosFiltrado = 0;
            // Cancelados
            // console.log("CanceladosAll: "+JSON.stringify(cancelados));
            // Retirar enviados há mais de um mês
            entriesEnviados.forEach((element) => {
              dataEnvio = element[1].DataEnvio;
              dayEnvio = dataEnvio.split("/")[0];
              monthEnvio = dataEnvio.split("/")[1];
              yearEnvio = dataEnvio.split("/")[2];
              sendDate = new Date(monthEnvio+"/"+
                dayEnvio+"/"+yearEnvio);
              sendDate.setDate(sendDate.getDate()+30);
              if (sendDate>today) {
                countEnviadosFiltrado+=1;
                enviadosFiltrado[element[0]] = element[1];
              }
            });
            console.log("Passou For Each Enviados");

            // Filtrando a Enviar
            const entriesEnviadosFiltrados = Object.entries(enviadosFiltrado);
            let count = 0;
            let countLidos = 0;
            let countAgendados = 0;
            let countUltimoAno = 0;
            let countEnviados = 0;
            let countCancelados = 0;

            const dataAtualAux = new Date();
            const dataAtual = JSON.stringify(dataAtualAux);

            // Lê entriesAEnviar do fim pro inicio
            entriesAEnviar.slice().reverse().forEach((pacAEnviar)=>{
              countLidos+=1;
              if (ambiente === "teste") {
                quantidadeEnvio = 3;
              }
              if (count<quantidadeEnvio) {
                // agendados
                if (agendados.some((pacAgendado) =>
                  pacAgendado.CodPaciente==pacAEnviar[1].CodPaciente)) {
                  countAgendados+=1;
                  // console.log("agendado " + pacAEnviar[1].Paciente);

                // ultimo ano
                } else if (ultimoAno.some((pacUltimoAno) =>
                  pacUltimoAno.CodPaciente==pacAEnviar[1].CodPaciente)) {
                  countUltimoAno+=1;
                  // console.log("ultimo ano " + pacAEnviar[1].Paciente);

                // enviados
                } else if (entriesEnviadosFiltrados.some((pacEnviado) =>
                  pacEnviado[1].CodPaciente==pacAEnviar[1].CodPaciente)) {
                  countEnviados+=1;
                  // console.log("ja enviado " + pacAEnviar[1].Paciente);

                // cancelados
                } else {
                  let cancelou = false;
                  const whatsApp = tel2Whats(pacAEnviar[1].Telefone)
                      .substring(2, 13);
                  if (cancelados[whatsApp]) {
                    const pacCanc = cancelados[whatsApp];
                    if ((pacCanc.Reenviar.toString() == "") ||
                      (JSON.stringify(pacCanc.Reenviar) > dataAtual)) {
                      cancelou = true;
                    } else {
                      // db.ref("OFT/45/buscaAtiva/ Cancelados/" +
                      // whatsApp).set(null);
                      db.ref("/OFT/45/_dadosComuns/cancelados/automatico/" +
                      whatsApp).set(null);
                      db.ref("/OFT/45/_dadosComuns/cancelados/" +
                      "1jApb1NOrMYoLce8MKxkUSLBpwEXbe1N1b33di08Ww40" +
                      "/Cancelados/" + whatsApp).set(null);
                    }
                  }
                  if (cancelou) {
                    countCancelados+=1;

                  // enviar
                  } else {
                    // console.log("enviou " + pacAEnviar[1].Paciente);
                    db.ref("OFT/45/buscaAtiva/aEnviarOnWrite").
                        push(pacAEnviar[1]);
                    pacAEnviar[1].DataEnvio = todayDate;
                    enviadosFiltrado[pacAEnviar[0]] = pacAEnviar[1];
                    count+=1;
                  }
                }
              }
            });
            console.log("Cancelados: " + countCancelados);
            console.log("Ja enviados no ultimo mes: " + countEnviados);
            console.log("Ultimo Ano: " + countUltimoAno);
            console.log("Agendados: " + countAgendados);
            console.log("Enviados Filtrado: " + countEnviadosFiltrado);
            console.log("Lidos: " + countLidos);
            console.log("Enviados com sucesso: " + count);

            // não salvar no nó
            if (ambiente === "producao") {
              db.ref("OFT/45/buscaAtiva/enviados").
                  set(enviadosFiltrado);
            }

            // resp.end("Ok"+resp.status.toString());
            return null;
          });
        });
      } catch (err) {
        // ... error checks
        console.log("Erro try: " + JSON.stringify(err));
      }
    });


exports.oft45BuscaAtivaZApi =
  functions.database.ref("OFT/45/buscaAtiva/aEnviarOnWrite/{pushId}")
      .onWrite((change, context) => {
        // Only edit data when it is first created.
        // if (change.before.exists()) {
        // return null;
        // }
        // Exit when the data is deleted.
        if (!change.after.exists()) {
          return null;
        }
        // const db = admin.database();
        // Grab the current value of what was written to the Realtime Database
        const element = change.after.val();
        console.log(JSON.stringify(element));

        let paciente = "";
        if (element.Paciente) {
          paciente = element.Paciente;
        }
        let whatsAppCel;
        if (element.Telefone) {
          whatsAppCel = tel2Whats(element.Telefone);
        }
        let codPaciente = "";
        if (element.Paciente) {
          codPaciente = element.CodPaciente;
        }
        let convenio = "";
        if (element.Convenio) {
          convenio = element.Convenio;
        }
        let dataAtendimento = "";
        if (element.DataAtendimento) {
          dataAtendimento = element.DataAtendimento;
          dataAtendimento = dataAtendimento.split("T")[0];
          const dia = dataAtendimento.split("-")[2];
          const mes = dataAtendimento.split("-")[1];
          const ano = dataAtendimento.split("-")[0];
          dataAtendimento = dia +"/"+ mes +"/"+ ano;
        }
        let medico = "";
        if (element.Medico) {
          medico = element.Medico;
        }
        // const message1Aux = whatsAppCel;
        if (ambiente == "teste") whatsAppCel = "5521971938840";

        // #OptionList
        const optionList = {
          // "title": "Opções disponíveis",
          "buttonLabel": "Clique aqui para responder",
          "options": [
            {
              "id": "BSCATV45-AGDCONS",
              "title": "Gostaria de agendar uma consulta",
            },
            {
              "id": "BSCATV45-LMBRFUT",
              "title": "Lembre-me novamente no futuro",
            },
            {
              "id": "BSCATV45-CANCMSG",
              "title": "Não desejo receber mais mensagem",
            },
          ],
        };


        if (medico != "Keller Henry Pena de Azevedo" &&
          medico != "Wilson Barros de Moraes Junior " &&
          medico != "Renato do Amaral Fernandes" &&
          convenio != "Intermedica" &&
          convenio != "Unimed Rio ( Pessoa Fisica )" &&
          convenio != "Unimed Usina") {
          if (whatsAppCel) {
            let parametros = {};
            if (ambiente == "teste") {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                token: "A8F754F1402CAE3625D5D578",
                // buttonList: buttonList,
                optionList: optionList,

              };
            } else {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "39C7A89881E470CC246252059E828D91",
                token: "B1CA83DE10E84496AECE8028",
                // buttonList: buttonList,
                optionList: optionList,

              };
            }

            const message1 = "Boa tarde! Tudo bem?" +
            "\nAqui é " +
            "da Oftalmo Day Dr. Antônio Lobo.\n\nVerificamos que " +
            "a última consulta de "+ paciente +" aconteceu há mais de um ano." +
            "\n\nUltimo Atendimento: " + dataAtendimento +
            "\nConvênio: " + convenio +
            "\nMédico: " + medico +
            "\nCodigo: " + codPaciente +
            "\n\n*Gostaria de agendar uma nova consulta?*";


            // if (ambiente === "teste") {
            //   message1 = message1Aux + " > " + paciente +
            //   " -> " + message1;
            // }

            // método antigo
            // const arrUrls = [message1];
            // const arrMessageType = ["text"];
            // const i = 0;
            // callZapiV2(arrUrls, arrMessageType, parametros, i);

            const arrMessage = [{
              "phone": whatsAppCel,
              "message": message1,
            }];
            const i = 0;
            callZapiV3(arrMessage, parametros, i);
          }
        }

        return null;
      });


exports.oft45CampanhaCatarataCriarNo = functions.https.
    onRequest((req, resp) => {
      console.log("Entrou no criar nó");
      const db = admin.database();
      db.ref("OFT/45/campanha/catarata/aEnviarOnWrite").set(true);
      db.ref("OFT/45/campanha/catarata/pacientesCompleto/").set(true);
      db.ref("OFT/45/campanha/catarata/enviados/").set(true);
      db.ref("OFT/45/campanha/catarata/configuracoes/quantidadeEnvio/")
          .set(true);
      resp.end("Ok\n"+resp.status.toString());
    });


exports.oft45CampanhaCatarataCargaMensal = functions
    .runWith({timeoutSeconds: 540}).https.
    onRequest((req, resp) => {
    // exports.oft45CampanhaCatarataCargaMensal = functions.pubsub
    //     .schedule("31 17 22 * *")
    //     .timeZone("America/Sao_Paulo") // Users can choose timezone
    //     .onRun((context) => {
      const dbRef = admin.database();

      dbRef.ref("OFT/45/campanha/catarata/pacientesCompleto").set(null)
          .then(() => {
            return sqlConnection.connect(sqlConfig).then((pool) => {
              const dbRef = admin.database();

              let queryBuscaAtiva = "";
              queryBuscaAtiva = "SELECT CodPaciente, Paciente, ";
              queryBuscaAtiva = queryBuscaAtiva + "DataAtendimento, ";
              queryBuscaAtiva = queryBuscaAtiva + "Convenio, ";
              queryBuscaAtiva = queryBuscaAtiva + "Medico, Telefone, ";
              queryBuscaAtiva = queryBuscaAtiva + "IDItem, Item, Nascimento ";
              queryBuscaAtiva = queryBuscaAtiva + "FROM dbo.vw_Excel";
              queryBuscaAtiva = queryBuscaAtiva + "_Sis_Atendimento";
              queryBuscaAtiva = queryBuscaAtiva + "_Campanhas_45";
              queryBuscaAtiva = queryBuscaAtiva + " WHERE (CodPaciente ";
              queryBuscaAtiva = queryBuscaAtiva + "IS NOT NULL) ";
              queryBuscaAtiva = queryBuscaAtiva + "AND (Nascimento < ";
              queryBuscaAtiva = queryBuscaAtiva + "CONVERT(DATETIME, ";
              queryBuscaAtiva = queryBuscaAtiva + "'1994-01-01 00:00:00', ";
              queryBuscaAtiva = queryBuscaAtiva + "102)) ";
              queryBuscaAtiva = queryBuscaAtiva + "AND (DataAtendimento < ";
              queryBuscaAtiva = queryBuscaAtiva + "CONVERT(DATETIME, ";
              queryBuscaAtiva = queryBuscaAtiva + "'2023-09-23 00:00:00', ";
              queryBuscaAtiva = queryBuscaAtiva + "102)) ";

              return pool.request().query(queryBuscaAtiva, (err, result) => {
                let codPac = "";
                // let strPar = "{";
                const buscaAtivaJson = {};
                result.recordset.forEach((element) => {
                  if (element.CodPaciente && element.Telefone &&
                    tel2Whats(element.Telefone)) {
                    // codPac = JSON.stringify("codPac_"
                    // +element.CodPaciente+"_"+
                    //   tel2Whats(element.Telefone));
                    // strPar += codPac+":"+JSON.stringify(element)+",";
                    codPac = "codPac_"+element.CodPaciente+"_"+
                      tel2Whats(element.Telefone);
                    const strData = JSON.stringify(element.DataAtendimento);
                    element.DataAtendimento = JSON.parse(strData);
                    buscaAtivaJson[codPac] = element;
                  }
                });
                // strPar = strPar.slice(0, -1) + "}";
                // console.log(strPar);
                // const buscaAtivaJson = JSON.parse(strPar);

                dbRef.ref("OFT/45/campanha/catarata/pacientesCompleto")
                    .set(buscaAtivaJson);
                resp.end("Ok"+resp.status.toString());
                // return null;
              });
            });
          });
    });


// exports.oft45CampanhaCatarataJson = functions.runWith({timeoutSeconds: 540})
//     .https.onRequest((req, resp) => {
exports.oft45CampanhaCatarataJson = functions.pubsub
    .schedule("00 10 * * *")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou no oft45CampanhaCatarataJson");

      const promises = [];
      let monthEnvio;
      let dayEnvio;
      let dataEnvio;
      let yearEnvio;
      let sendDate;
      const today = new Date();
      const todayDate = today.getDate()+"/"+(today.getMonth()+1)+"/"+
      today.getFullYear();
      const db = admin.database();
      db.ref("OFT/45/campanha/catarata/aEnviarOnWrite").set(true);

      try {
        return sqlConnection.connect(sqlConfig).then((pool) => {
          console.log("Entrou connect");
          promises.push(db.ref("OFT/45/campanha/catarata/pacientesCompleto/")
              .once("value"));
          promises.push(db.ref("OFT/45/campanha/catarata/enviados/")
              .once("value"));
          promises.push(db.ref(
              "OFT/45/campanha/catarata/configuracoes/quantidadeEnvio/")
              .once("value"));
          promises.push(oft45CanceladosAll());
          return Promise.all(promises).then((res) => {
            console.log("Entrou Promise");
            // Armazenamento leitura dos DB
            // const agendados = res[0].recordsets[0];
            // const ultimoAno = res[0].recordsets[1];
            const aEnviar = res[0].val();
            const enviados = res[1].val();
            const quantidadeEnvio = res[2].val();
            const cancelados = res[3];

            // Processamento dos Enviados
            // Remoção de pacientes enviados há mais de 1 mês
            const entriesEnviados = Object.entries(enviados);
            const entriesAEnviar = Object.entries(aEnviar);
            // const entriesCancelados = Object.entries(cancelados);
            const enviadosFiltrado = {};
            let countEnviadosFiltrado = 0;
            // Cancelados
            // console.log("CanceladosAll: "+JSON.stringify(cancelados));
            // Retirar enviados há mais de um mês
            entriesEnviados.forEach((element) => {
              dataEnvio = element[1].DataEnvio;
              dayEnvio = dataEnvio.split("/")[0];
              monthEnvio = dataEnvio.split("/")[1];
              yearEnvio = dataEnvio.split("/")[2];
              sendDate = new Date(monthEnvio+"/"+
                dayEnvio+"/"+yearEnvio);
              sendDate.setDate(sendDate.getDate()+30);
              if (sendDate>today) {
                countEnviadosFiltrado+=1;
                enviadosFiltrado[element[0]] = element[1];
              }
            });
            console.log("Passou For Each Enviados");

            // Filtrando a Enviar
            const entriesEnviadosFiltrados = Object.entries(enviadosFiltrado);
            let count = 0;
            let countLidos = 0;
            const countAgendados = 0;
            const countUltimoAno = 0;
            let countEnviados = 0;
            let countCancelados = 0;

            const dataAtualAux = new Date();
            const dataAtual = JSON.stringify(dataAtualAux);
            // Lê entriesAEnviar do fim pro inicio
            entriesAEnviar.slice().forEach((pacAEnviar)=>{
              countLidos+=1;
              if (count<quantidadeEnvio) {
                // // agendados
                // if (agendados.some((pacAgendado) =>
                //   pacAgendado.CodPaciente==pacAEnviar[1].CodPaciente)) {
                //   // countAgendados+=1;
                //   // console.log("agendado " + pacAEnviar[1].Paciente);

                // // ultimo ano
                // } else if (ultimoAno.some((pacUltimoAno) =>
                //   pacUltimoAno.CodPaciente==pacAEnviar[1].CodPaciente)) {
                //   // countUltimoAno+=1;
                //   // console.log("ultimo ano " + pacAEnviar[1].Paciente); */

                // enviados
                if (entriesEnviadosFiltrados.some((pacEnviado) =>
                  pacEnviado[1].CodPaciente==pacAEnviar[1].CodPaciente)) {
                  countEnviados+=1;
                  // console.log("ja enviado " + pacAEnviar[1].Paciente);

                // cancelados
                } else {
                  let cancelou = false;
                  const whatsApp = tel2Whats(pacAEnviar[1].Telefone)
                      .substring(2, 13);
                  // console.log("whatsapp " + whatsApp);
                  if (cancelados[whatsApp]) {
                    const pacCanc = cancelados[whatsApp];
                    if ((pacCanc.Reenviar.toString() == "") ||
                      (JSON.stringify(pacCanc.Reenviar) > dataAtual)) {
                      cancelou = true;
                    } else {
                      // db.ref("OFT/45/buscaAtiva/ Cancelados/" +
                      // whatsApp).set(null);
                      db.ref("/OFT/45/_dadosComuns/cancelados/automatico/" +
                      whatsApp).set(null);
                      db.ref("/OFT/45/_dadosComuns/cancelados/" +
                      "1jApb1NOrMYoLce8MKxkUSLBpwEXbe1N1b33di08Ww40" +
                      "/Cancelados/" + whatsApp).set(null);
                    }
                  }
                  if (cancelou) {
                    countCancelados+=1;

                  // enviar
                  } else {
                    // console.log("enviou " + pacAEnviar[1].Paciente);
                    db.ref("OFT/45/campanha/catarata/aEnviarOnWrite").
                        push(pacAEnviar[1]);
                    pacAEnviar[1].DataEnvio = todayDate;
                    enviadosFiltrado[pacAEnviar[0]] = pacAEnviar[1];
                    count+=1;
                  }
                }
              }
            });
            console.log("Cancelados: " + countCancelados);
            console.log("Ja enviados no ultimo mes: " + countEnviados);
            console.log("Ultimo Ano: " + countUltimoAno);
            console.log("Agendados: " + countAgendados);
            console.log("Enviados Filtrado: " + countEnviadosFiltrado);
            console.log("Lidos: " + countLidos);
            console.log("Enviados com sucesso: " + count);

            // não salvar no nó
            // if (ambiente === "producao") {
            db.ref("OFT/45/campanha/catarata/enviados").
                set(enviadosFiltrado);
            // }

            // resp.end("Ok"+resp.status.toString());
            return null;
          });
        });
      } catch (err) {
        // ... error checks
        console.log("Erro try: " + JSON.stringify(err));
      }
    });


exports.oft45CampanhaCatarataZApi =
    functions.database.ref("OFT/45/campanha/catarata/aEnviarOnWrite/{pushId}")
        .onWrite((change, context) => {
          // Only edit data when it is first created.
          // if (change.before.exists()) {
          // return null;
          // }
          // Exit when the data is deleted.
          if (!change.after.exists()) {
            return null;
          }
          // const db = admin.database();
          // Grab the current value of what was written to the RT Database
          const element = change.after.val();
          console.log(JSON.stringify(element));
          let paciente = "";
          if (element.Paciente) {
            paciente = element.Paciente;
          }
          let whatsAppCel;
          if (element.Telefone) {
            whatsAppCel = tel2Whats(element.Telefone);
          }
          // let dataNascimento;
          // if (element.Nascimento) {
          //   dataNascimento = element.Nascimento;
          // }
          // const message1Aux = whatsAppCel;

          if (ambiente == "teste") whatsAppCel = "5521971938840"; // gabriel

          if (whatsAppCel) {
            let parametros = {};
            if (ambiente == "teste") {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                token: "A8F754F1402CAE3625D5D578",
                // buttonList: buttonList,
              };
            } else {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "39C7A89881E470CC246252059E828D91",
                token: "B1CA83DE10E84496AECE8028",
                // buttonList: buttonList,
              };
            }

            // CAMPANHA CATARATA

            const message1 = "*PREVENÇÃO À CATARATA - AVALIAÇÃO GRATUITA*" +
            "\n\nOlá "+ paciente + ", tudo bem?" +
            "\n\nNo *dia 27 de Abril das 8:00 às 12:00* iremos " +
            "realizar novamente o "+
            "evento sobre a *Prevenção da Catarata*." +
            "\n*Esse evento é gratuito*." +
            "\nTeremos na clínica 4 médicos especialistas em Catarata " +
            "para poder verificar o estágio da sua catarata, " +
            "esclarecer todas " +
            "as suas dúvidas, tratamentos disponíveis, os riscos da " +
            "catarata e a importância do acompanhamento médico oftalmológico." +
            "\nTraga seus familiares e amigos!" +
            "\n\nPara agendar sua participação basta responder " +
            "QUERO PARTICIPAR nessa mensagem " +
            "ou entre em contato pelo telefone: (21) 3872-6161";


            // CAMPANHA PALPEBRA

            // const emojiUse1 = emoji.get("thinking"); // 🤔
            // const emojiUse2 = emoji.get("smile"); // 😄
            // const emojiUse3 = emoji.get("wink"); // 😉

            // const message1 = "*SUA PÁLPEBRA MAIS BONITA!*" +
            // "\nOlá " + paciente + ". Tudo bem?" +
            // "\n\nO seu olhar está com aspecto de cansado? " +
            // "A sobra de pele da pálpebra te incomoda? " + emojiUse1 +
            // "\n\nVocê que já é nosso paciente pode ter o olhar " +
            // " descansado " +
            // "novamente através de uma pequena cirurgia *com preços mais " +
            // "acessíveis em até 12x* e ainda " +
            // "melhorar as rugas ao redor dos olhos com peeling." +
            // emojiUse2 +
            // "\n\nPara mais informações, basta escrever QUERO SABER MAIS! " +
            //   emojiUse3;

            // if (ambiente === "teste") {
            //   message1 = message1Aux + " > " + paciente +
            //   + " " + dataNascimento +
            //   " -> " + message1;
            // }
            const arrUrls = [message1];
            const arrMessageType = ["text"];
            const i = 0;
            callZapiV2(arrUrls, arrMessageType, parametros, i);
          }

          // return null;
        });


// exports.oft45CampanhaCatarataConfirmacaocriarNo = functions.https.
//     onRequest((req, resp) => {
//       console.log("Entrou no criar nó");
//       const db = admin.database();
//       db.ref("OFT/45/campanha/catarata/confirmacaoPaciente/aEnviarOnWrite")
//           .set(true);
//       resp.end("Ok\n"+resp.status.toString());
//     });


exports.oft45CampanhaCatarataConfirmacaoJson = functions.https.
    onRequest((req, resp) => {
      console.log("Entrou Função oft45CampanhaCatarataConfirmacaoJson");
      const today = new Date();
      // const year = today.getFullYear();
      // const mm = today.getMonth()+1;
      // const dd = today.getDate();
      const diaDaSemana = today.getDay();
      if (diaDaSemana != 0 && diaDaSemana != 6 ) {
        try {
          // make sure that any items are correctly
          // URL encoded in the connection string
          // console.log("Entrou try");
          return sqlConnection.connect(sqlConfig).then((pool) => {
            // pool.sqlConnection.connect(sqlConfig);
            // console.log("Entrou connect");

            let sql = "";
            sql = "SELECT * ";
            sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
            sql = sql + "WHERE  DataMarcada >= '2024-04-27' ";
            sql = sql + "AND  DataMarcada < '2024-04-28' ";
            sql = sql + "ORDER BY DataMarcada";

            return pool.query(sql);
            // const result = pool.query(sql);
          }).then((result) => {
            const db = admin.database();
            const ref = db
                .ref("OFT/45/campanha/catarata/" +
                              "confirmacaoPaciente/aEnviarOnWrite");
            result.recordset.forEach((element) => {
              /*
              const year = element.DataMarcada.substring(0, 3);
              const mm = element.DataMarcada.substring(5, 6);
              const dd = element.DataMarcada.substring(8, 9);
              const hh = element.DataMarcada.substring(11, 12);
              const min = element.DataMarcada.substring(14, 15);
              */
              const year = element.DataMarcada.getFullYear();
              const mm = element.DataMarcada.getMonth()+1;
              const dd = element.DataMarcada.getDate();
              const hh = element.DataMarcada.getHours();
              let min = element.DataMarcada.getMinutes();
              if (min == 0 ) {
                min = "00";
              }
              const dataMarcada = dd + "/" + mm + "/" +
                year + "  " + hh + ":" + min;
              element.DataMarcada = dataMarcada;
              ref.push(element);
            });
            resp.end("Ok"+resp.status.toString());
            // ref.set(true);
            // return null;
          });
        } catch (err) {
          // ... error checks
          console.log("Erro try: " + JSON.stringify(err));
        }
      }
    });


exports.oft45CampanhaCatarataConfirmacaoZApi = functions.database
    .ref("OFT/45/campanha/catarata/confirmacaoPaciente/aEnviarOnWrite/{pushId}")
    .onWrite((change, context) => {
      // Only edit data when it is first created.
      // if (change.before.exists()) {
      // return null;
      // }
      // Exit when the data is deleted.
      if (!change.after.exists()) {
        return null;
      }
      const db = admin.database();
      // Grab the current value of what was written to the Realtime Database
      const element = change.after.val();
      console.log(JSON.stringify(element));
      const endereco = "Praça Saenz Pena 45, sala 1508 - Tijuca";
      // console.log("forEach. element:" + JSON.stringify(element));
      let paciente = "";
      let dataMarcada = "";
      let telCom = "";
      let telRes = "";
      let tel = "";
      let telCel = "";
      // let IDMarcacao = "";
      if (element.Paciente) {
        paciente = element.Paciente;
      }
      if (element.DataMarcada) {
        dataMarcada = element.DataMarcada;
      }

      // if (element.IDMarcacao) {
      //   IDMarcacao = element.IDMarcacao;
      // }

      if (element.TelefoneCom) {
        telCom = element.TelefoneCom.replace("(", "");
        telCom = telCom.replace(")", "");
        telCom = telCom.replace(".", "");
        telCom = telCom.replace(" ", "");
        telCom = telCom.replace("-", "");
        telCom = telCom.replace("-", "");
        // console.log("element.TelefoneCom: " + element.TelefoneCom);
        // console.log("telCom: " + telCom);
      }
      if (element.TelefoneCel) {
        telCel = element.TelefoneCel.replace("(", "");
        telCel = telCel.replace(")", "");
        telCel = telCel.replace(".", "");
        telCel = telCel.replace(" ", "");
        telCel = telCel.replace("-", "");
        telCel = telCel.replace("-", "");
        // console.log("element.TelefoneCel: " + element.TelefoneCel);
        // console.log("telCel: " + telCel);
      }
      if (element.TelefoneRes) {
        telRes = element.TelefoneRes.replace("(", "");
        telRes = telRes.replace(")", "");
        telRes = telRes.replace(".", "");
        telRes = telRes.replace(" ", "");
        telRes = telRes.replace("-", "");
        telRes = telRes.replace("-", "");
        // console.log("element.TelefoneRes: " + element.TelefoneRes);
        // console.log("telRes: " + telRes);
      }
      if (element.Telefone) {
        tel = element.Telefone.replace("(", "");
        tel = tel.replace(")", "");
        tel = tel.replace(".", "");
        tel = tel.replace(" ", "");
        tel = tel.replace("-", "");
        tel = tel.replace("-", "");
        // console.log("element.Telefone: " + element.Telefone);
        // console.log("tel: " + tel);
      }
      let whatsAppCel = "";
      if (tel&&(tel.substring(2, 3) == "9")) {
        whatsAppCel = "55" + tel;
      } else if ((telCel)&&(telCel.substring(2, 3) == "9")) {
        whatsAppCel = "55" + telCel;
      } else if ((telRes)&&(telRes.substring(2, 3) == "9")) {
        whatsAppCel = "55" + telRes;
      } else if ((telCom)&&(telCom.substring(2, 3) == "9")) {
        whatsAppCel = "55" + telCom;
      }
      const whatsAppCelPaciente = whatsAppCel;
      if (ambiente == "teste") whatsAppCel = "5521971938840";

      // console.log("whatsAppCel: " + whatsAppCel);
      if (whatsAppCel) {
        // dd/mm/yyyy hh:mm
        const year = dataMarcada.split("/")[2].split(" ")[0];
        const mm = dataMarcada.split("/")[1];
        const dd = dataMarcada.split("/")[0];
        // const hh = dataMarcada.substring(9, 10);
        // const min = dataMarcada.substring(12, 13);

        let message1 = "Olá! Aqui é da Oftalmo Day." +
        "\n\nGostaríamos de confirmar sua participação no " +
        "*Evento de Prevenção da Catarata*" +
        "\n*Paciente:* " + paciente +
        "\n*Data:* 27/04/2024 (sábado)" +
        "\n*Endereço:* " + endereco +
        "\n\n*CONFIRMA*?";

        if (ambiente == "teste") {
          message1 = whatsAppCelPaciente + "\n" + message1;
        }

        const postData = JSON.stringify({
          "phone": whatsAppCel,
          "message": message1,

        });
        const req = new XMLHttpRequest();
        let urlZapi = "";

        if (ambiente == "teste") {
          urlZapi = "https://api.z-api.io/instances/" +
          "3B74CE9AFF0D20904A9E9E548CC778EF/token/" +
          "A8F754F1402CAE3625D5D578/send-text";
        } else {
          urlZapi = "https://api.z-api.io/instances/" +
          "39C7A89881E470CC246252059E828D91/token/" +
          "B1CA83DE10E84496AECE8028/send-text";
        }
        req.open("POST", urlZapi, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.onerror = () => {
          console.log("Entrou onerror: " + req.statusText);
        };
        req.onload = () => {
          console.log("Entrou onload. req.status: " + req.status);
          if (req.status == 200) {
            console.log("Z-API chamado com sucesso: " + whatsAppCel);
            console.log(year+"/"+mm+"/"+dd);
            const pushID = context.params.pushId;
            const refAEnviar = db
                .ref("OFT/45/campanha/catarata/" +
                      "confirmacaoPaciente/aEnviarOnWrite/" + pushID);
            refAEnviar.set(null);
          } else {
            console.log("Erro chamando Z-API.");
          }
        };
        // setTimeout(function() {
        // req.send(postData);
        // }, 500);
        req.send(postData);
        console.log("req.send(postData): " + postData);
        // });
      }
      // You must return a Promise when performing
      // asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling
      // in the Realtime Database returns a Promise.
      return null;
    });


exports.oft45CampanhaLoboSaudeCriarNo = functions.https.
    onRequest((req, resp) => {
      console.log("Entrou no criar nó");
      const db = admin.database();
      db.ref("OFT/45/campanha/loboSaude/aEnviarOnWrite").set(true);
      db.ref("OFT/45/campanha/loboSaude/pacientesCompleto/").set(true);
      db.ref("OFT/45/campanha/loboSaude/enviados/").set(true);
      db.ref("OFT/45/campanha/loboSaude/configuracoes/quantidadeEnvio/")
          .set(true);
      resp.end("Ok\n"+resp.status.toString());
    });


exports.oft45CampanhaLoboSaudeCargaMensal = functions
    .runWith({timeoutSeconds: 540}).pubsub
    .schedule("40 17 * * *")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("ENTROU oft45CampanhaLoboSaudeCargaMensal");
      const dbRef = admin.database();

      return dbRef.ref("OFT/45/campanha/loboSaude/pacientesCompleto").set(null)
          .then(() => {
            try {
              return sqlConnection.connect(sqlConfig).then((pool) => {
                let queryBuscaAtiva = "";
                queryBuscaAtiva = "SELECT * FROM dbo.vw_Excel_Sis_Atendimento";
                queryBuscaAtiva = queryBuscaAtiva + "_Busca_Ativa_45 ";
                queryBuscaAtiva = queryBuscaAtiva + "ORDER BY DataAtendimento";
                return pool.query(queryBuscaAtiva);
              }).then((result) => {
                let codPac = "";
                const buscaAtivaJson = {};
                result.recordset.forEach((element) => {
                  if (element.CodPaciente && element.Telefone &&
                    tel2Whats(element.Telefone)) {
                    codPac = "codPac_"+element.CodPaciente+"_"+
                      tel2Whats(element.Telefone);
                    const strData = JSON.stringify(element.DataAtendimento);
                    element.DataAtendimento = JSON.parse(strData);
                    buscaAtivaJson[codPac] = element;
                  }
                });
                dbRef.ref("OFT/45/campanha/loboSaude/pacientesCompleto")
                    .set(buscaAtivaJson);

                // resp.end("Ok"+resp.status.toString());
                return null;
              });
            } catch (err) {
            // ... error checks
              console.log("Erro try: " + JSON.stringify(err));
            }
          });
    });


// exports.oft45CampanhaLoboSaudeJson = functions.runWith({timeoutSeconds: 540})
//     .https.onRequest((req, resp) => {
exports.oft45CampanhaLoboSaudeJson = functions.pubsub
    .schedule("30 12 * * 1-5")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou no oft45CampanhaLoboSaudeJson");

      const promises = [];
      let monthEnvio;
      let dayEnvio;
      let dataEnvio;
      let yearEnvio;
      let sendDate;
      const today = new Date();
      const todayDate = today.getDate()+"/"+(today.getMonth()+1)+"/"+
      today.getFullYear();
      const db = admin.database();
      db.ref("OFT/45/campanha/loboSaude/aEnviarOnWrite").set(true);

      try {
        return sqlConnection.connect(sqlConfig).then((pool) => {
          console.log("Entrou connect");
          promises.push(db.ref("OFT/45/campanha/loboSaude/pacientesCompleto/")
              .once("value"));
          promises.push(db.ref("OFT/45/campanha/loboSaude/enviados/")
              .once("value"));
          promises.push(db.ref(
              "OFT/45/campanha/loboSaude/configuracoes/quantidadeEnvio/")
              .once("value"));
          promises.push(db.ref(
              "OFT/45/buscaAtiva/enviados/").once("value"));

          promises.push(oft45CanceladosAll());
          return Promise.all(promises).then((res) => {
            console.log("Entrou Promise");
            // Armazenamento leitura dos DB
            // const agendados = res[0].recordsets[0];
            // const ultimoAno = res[0].recordsets[1];
            const aEnviar = res[0].val();
            const enviados = res[1].val();
            const quantidadeEnvio = res[2].val();
            const cancelados = res[3];

            // Processamento dos Enviados
            // Remoção de pacientes enviados há mais de 1 mês
            const entriesEnviados = Object.entries(enviados);
            const entriesAEnviar = Object.entries(aEnviar);
            // const entriesCancelados = Object.entries(cancelados);
            const enviadosFiltrado = {};
            let countEnviadosFiltrado = 0;
            // Cancelados
            // console.log("CanceladosAll: "+JSON.stringify(cancelados));
            // Retirar enviados há mais de um mês
            entriesEnviados.forEach((element) => {
              dataEnvio = element[1].DataEnvio;
              dayEnvio = dataEnvio.split("/")[0];
              monthEnvio = dataEnvio.split("/")[1];
              yearEnvio = dataEnvio.split("/")[2];
              sendDate = new Date(monthEnvio+"/"+
                dayEnvio+"/"+yearEnvio);
              sendDate.setDate(sendDate.getDate()+30);
              if (sendDate>today) {
                countEnviadosFiltrado+=1;
                enviadosFiltrado[element[0]] = element[1];
              }
            });
            console.log("Passou For Each Enviados");

            // Filtrando a Enviar
            const entriesEnviadosFiltrados = Object.entries(enviadosFiltrado);
            let count = 0;
            let countLidos = 0;
            const countAgendados = 0;
            const countUltimoAno = 0;
            let countEnviados = 0;
            let countCancelados = 0;

            const dataAtualAux = new Date();
            const dataAtual = JSON.stringify(dataAtualAux);
            // Lê entriesAEnviar do fim pro inicio
            entriesAEnviar.slice().forEach((pacAEnviar)=>{
              countLidos+=1;
              if (count<quantidadeEnvio) {
                // enviados
                if (entriesEnviadosFiltrados.some((pacEnviado) =>
                  pacEnviado[1].CodPaciente==pacAEnviar[1].CodPaciente)) {
                  countEnviados+=1;
                  // console.log("ja enviado " + pacAEnviar[1].Paciente);

                // cancelados
                } else {
                  let cancelou = false;
                  const whatsApp = tel2Whats(pacAEnviar[1].Telefone)
                      .substring(2, 13);
                  // console.log("whatsapp " + whatsApp);
                  if (cancelados[whatsApp]) {
                    const pacCanc = cancelados[whatsApp];
                    if ((pacCanc.Reenviar.toString() == "") ||
                      (JSON.stringify(pacCanc.Reenviar) > dataAtual)) {
                      cancelou = true;
                    } else {
                      // db.ref("OFT/45/buscaAtiva/ Cancelados/" +
                      // whatsApp).set(null);
                      db.ref("/OFT/45/_dadosComuns/cancelados/automatico/" +
                      whatsApp).set(null);
                      db.ref("/OFT/45/_dadosComuns/cancelados/" +
                      "1jApb1NOrMYoLce8MKxkUSLBpwEXbe1N1b33di08Ww40" +
                      "/Cancelados/" + whatsApp).set(null);
                    }
                  }
                  if (cancelou) {
                    countCancelados+=1;

                  // enviar
                  } else {
                    // console.log("enviou " + pacAEnviar[1].Paciente);
                    db.ref("OFT/45/campanha/loboSaude/aEnviarOnWrite").
                        push(pacAEnviar[1]);
                    pacAEnviar[1].DataEnvio = todayDate;
                    enviadosFiltrado[pacAEnviar[0]] = pacAEnviar[1];
                    count+=1;
                  }
                }
              }
            });
            console.log("Cancelados: " + countCancelados);
            console.log("Ja enviados no ultimo mes: " + countEnviados);
            console.log("Ultimo Ano: " + countUltimoAno);
            console.log("Agendados: " + countAgendados);
            console.log("Enviados Filtrado: " + countEnviadosFiltrado);
            console.log("Lidos: " + countLidos);
            console.log("Enviados com sucesso: " + count);

            // não salvar no nó
            // if (ambiente === "producao") {
            db.ref("OFT/45/campanha/loboSaude/enviados").
                set(enviadosFiltrado);
            // }

            // resp.end("Ok"+resp.status.toString());
            return null;
          });
        });
      } catch (err) {
        // ... error checks
        console.log("Erro try: " + JSON.stringify(err));
      }
    });

exports.oft45CampanhaLoboSaudeZApi =
    functions.database.ref("OFT/45/campanha/loboSaude/aEnviarOnWrite/{pushId}")
        .onWrite((change, context) => {
          if (!change.after.exists()) {
            return null;
          }
          const element = change.after.val();
          console.log(JSON.stringify(element));
          let paciente = "";
          if (element.Paciente) {
            paciente = element.Paciente;
          }
          let whatsAppCel;
          if (element.Telefone) {
            whatsAppCel = tel2Whats(element.Telefone);
          }
          // let dataNascimento;
          // if (element.Nascimento) {
          //   dataNascimento = element.Nascimento;
          // }
          // const message1Aux = whatsAppCel;

          if (ambiente == "teste") whatsAppCel = "5521971938840"; // gabriel

          if (whatsAppCel) {
            let parametros = {};
            if (ambiente == "teste") {
              // parametros = {
              //   whatsAppCel: whatsAppCel,
              //   id: "3B74CE9AFF0D20904A9E9E548CC778EF",
              //   token: "A8F754F1402CAE3625D5D578",
              //   // buttonList: buttonList,

              // instancia teste ocupada, usando 45
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "39C7A89881E470CC246252059E828D91",
                token: "B1CA83DE10E84496AECE8028",
                // buttonList: buttonList,
              };
              // };
            } else {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "39C7A89881E470CC246252059E828D91",
                token: "B1CA83DE10E84496AECE8028",
                // buttonList: buttonList,
              };
            }
            const urlImage = "https://firebasestorage.googleapis.com/" +
            "v0/b/oftautomacao-9b427.appspot.com/o/Oftalmologia%2FProjeto" +
            "%20Folder%20Oftalmoday_page-0002.jpg?alt=media&token=d17806d6" +
            "-af80-434e-8d71-90ed60c6c16c";

            const message1 = "*ESTÁ ADIANDO SUA CONSULTA " +
            "POR QUESTÕES FINANCEIRAS? SUA VISÃO PODE " +
            "ESTAR EM RISCO!*" +
            "\n\nOlá, " + paciente + "! Tudo bem?" +
            "\n\nDoenças como catarata, glaucoma e lesões na retina " +
            "podem ser silenciosas e levar à cegueira, mas com " +
            "cuidados regulares é possível detectá-las precocemente " +
            "e tratá-las de forma eficaz. Entretanto, os custos " +
            "oftalmológicos muitas vezes nos impedem de fazer um " +
            "acompanhamento adequado." +
            "\n\nPara ajudar você, a Oftalmo Day Dr. Antônio Lobo " +
            "criou o *Plano de Assinatura Lobo Saúde* com " +
            "soluções oftalmológicas personalizadas e uma variedade " +
            "de serviços extras, descontos e benefícios exclusivos." +
            "\n\nNão deixe para " +
            "depois! Entre em contato agora mesmo e compartilhe essa " +
            "oportunidade com amigos e familiares." +
            "\n\nPara mais informações, basta escrever *QUERO SABER MAIS!*";

            // if (ambiente === "teste") {
            //   message1 = message1Aux + " > " + paciente +
            //   + " " + dataNascimento +
            //   " -> " + message1;
            // }

            // método novo com video
            const arrMessage = [{
              "phone": whatsAppCel,
              "image": urlImage,
              "caption": message1,
            }];

            // const arrUrls = [message1];
            // const arrMessageType = ["text"];
            const i = 0;
            callZapiV3(arrMessage, parametros, i);
          }

          // return null;
        });

exports.oft45CampanhaPalpebraCriarNo = functions.https.
    onRequest((req, resp) => {
      console.log("Entrou no criar nó");
      const db = admin.database();
      db.ref("OFT/45/campanha/palpebra/aEnviarOnWrite").set(true);
      db.ref("OFT/45/campanha/palpebra/pacientesCompleto/").set(true);
      db.ref("OFT/45/campanha/palpebra/enviados/").set(true);
      db.ref("OFT/45/campanha/palpebra/configuracoes/quantidadeEnvio/")
          .set(true);
      resp.end("Ok\n"+resp.status.toString());
    });


// exports.oft45CampanhaPalpebraCargaMensal = functions.https.
//     onRequest((req, resp) => {
exports.oft45CampanhaPalpebraCargaMensal = functions.pubsub
    .schedule("50 17 * * *")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      return sqlConnection.connect(sqlConfig).then((pool) => {
        const dbRef = admin.database();

        let queryBuscaAtiva = "";
        queryBuscaAtiva = "SELECT CodPaciente, Paciente, DataAtendimento, ";
        queryBuscaAtiva = queryBuscaAtiva + "Convenio, Medico, Telefone, ";
        queryBuscaAtiva = queryBuscaAtiva + "IDItem, Item, Nascimento ";
        queryBuscaAtiva = queryBuscaAtiva + "FROM dbo.vw_Excel";
        queryBuscaAtiva = queryBuscaAtiva + "_Sis_Atendimento";
        queryBuscaAtiva = queryBuscaAtiva + "_Campanhas_45";
        queryBuscaAtiva = queryBuscaAtiva + " WHERE (CodPaciente ";
        queryBuscaAtiva = queryBuscaAtiva + "IS NOT NULL) ";
        queryBuscaAtiva = queryBuscaAtiva + "AND (Nascimento < ";
        queryBuscaAtiva = queryBuscaAtiva + "CONVERT(DATETIME, ";
        queryBuscaAtiva = queryBuscaAtiva + "'1984-01-01 00:00:00', 102)) ";

        return pool.request().query(queryBuscaAtiva, (err, result) => {
          let codPac = "";
          let strPar = "{";
          result.recordset.forEach((element) => {
            if (element.CodPaciente && element.Telefone &&
              tel2Whats(element.Telefone)) {
              codPac = JSON.stringify("codPac_"+element.CodPaciente+"_"+
                tel2Whats(element.Telefone));
              strPar += codPac+":"+JSON.stringify(element)+",";
            }
          });
          strPar = strPar.slice(0, -1) + "}";
          // console.log(strPar);
          const buscaAtivaJson = JSON.parse(strPar);

          dbRef.ref("OFT/45/campanha/palpebra/pacientesCompleto")
              .set(buscaAtivaJson);
          // resp.end("Ok"+resp.status.toString());
          return null;
        });
      });
    });


// exports.oft45CampanhaPalpebraJson = functions.runWith({timeoutSeconds: 540})
//     .https.onRequest((req, resp) => {
exports.oft45CampanhaPalpebraJson = functions.pubsub
    .schedule("00 10 * * 1-5")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou no oft45CampanhaPalpebraJson");

      const promises = [];
      let monthEnvio;
      let dayEnvio;
      let dataEnvio;
      let yearEnvio;
      let sendDate;
      const today = new Date();
      const todayDate = today.getDate()+"/"+(today.getMonth()+1)+"/"+
      today.getFullYear();
      const db = admin.database();
      db.ref("OFT/45/campanha/palpebra/aEnviarOnWrite").set(true);

      try {
        return sqlConnection.connect(sqlConfig).then((pool) => {
          console.log("Entrou connect");
          promises.push(db.ref("OFT/45/campanha/palpebra/pacientesCompleto/")
              .once("value"));
          promises.push(db.ref("OFT/45/campanha/palpebra/enviados/")
              .once("value"));
          promises.push(db.ref(
              "OFT/45/campanha/palpebra/configuracoes/quantidadeEnvio/")
              .once("value"));
          promises.push(oft45CanceladosAll());
          return Promise.all(promises).then((res) => {
            console.log("Entrou Promise");
            // Armazenamento leitura dos DB
            // const agendados = res[0].recordsets[0];
            // const ultimoAno = res[0].recordsets[1];
            const aEnviar = res[0].val();
            const enviados = res[1].val();
            const quantidadeEnvio = res[2].val();
            const cancelados = res[3];

            // Processamento dos Enviados
            // Remoção de pacientes enviados há mais de 1 mês
            const entriesEnviados = Object.entries(enviados);
            const entriesAEnviar = Object.entries(aEnviar);
            // const entriesCancelados = Object.entries(cancelados);
            const enviadosFiltrado = {};
            let countEnviadosFiltrado = 0;
            // Cancelados
            // console.log("CanceladosAll: "+JSON.stringify(cancelados));
            // Retirar enviados há mais de um mês
            entriesEnviados.forEach((element) => {
              dataEnvio = element[1].DataEnvio;
              dayEnvio = dataEnvio.split("/")[0];
              monthEnvio = dataEnvio.split("/")[1];
              yearEnvio = dataEnvio.split("/")[2];
              sendDate = new Date(monthEnvio+"/"+
                dayEnvio+"/"+yearEnvio);
              sendDate.setDate(sendDate.getDate()+30);
              if (sendDate>today) {
                countEnviadosFiltrado+=1;
                enviadosFiltrado[element[0]] = element[1];
              }
            });
            console.log("Passou For Each Enviados");

            // Filtrando a Enviar
            const entriesEnviadosFiltrados = Object.entries(enviadosFiltrado);
            let count = 0;
            let countLidos = 0;
            const countAgendados = 0;
            const countUltimoAno = 0;
            let countEnviados = 0;
            let countCancelados = 0;

            const dataAtualAux = new Date();
            const dataAtual = JSON.stringify(dataAtualAux);
            // Lê entriesAEnviar do fim pro inicio
            entriesAEnviar.slice().forEach((pacAEnviar)=>{
              countLidos+=1;
              if (count<quantidadeEnvio) {
                // // agendados
                // if (agendados.some((pacAgendado) =>
                //   pacAgendado.CodPaciente==pacAEnviar[1].CodPaciente)) {
                //   // countAgendados+=1;
                //   // console.log("agendado " + pacAEnviar[1].Paciente);

                // // ultimo ano
                // } else if (ultimoAno.some((pacUltimoAno) =>
                //   pacUltimoAno.CodPaciente==pacAEnviar[1].CodPaciente)) {
                //   // countUltimoAno+=1;
                //   // console.log("ultimo ano " + pacAEnviar[1].Paciente); */

                // enviados
                if (entriesEnviadosFiltrados.some((pacEnviado) =>
                  pacEnviado[1].CodPaciente==pacAEnviar[1].CodPaciente)) {
                  countEnviados+=1;
                  // console.log("ja enviado " + pacAEnviar[1].Paciente);

                // cancelados
                } else {
                  let cancelou = false;
                  const whatsApp = tel2Whats(pacAEnviar[1].Telefone)
                      .substring(2, 13);
                  // console.log("whatsapp " + whatsApp);
                  if (cancelados[whatsApp]) {
                    const pacCanc = cancelados[whatsApp];
                    if ((pacCanc.Reenviar.toString() == "") ||
                      (JSON.stringify(pacCanc.Reenviar) > dataAtual)) {
                      cancelou = true;
                    } else {
                      // db.ref("OFT/45/buscaAtiva/ Cancelados/" +
                      // whatsApp).set(null);
                      db.ref("/OFT/45/_dadosComuns/cancelados/automatico/" +
                      whatsApp).set(null);
                      db.ref("/OFT/45/_dadosComuns/cancelados/" +
                      "1jApb1NOrMYoLce8MKxkUSLBpwEXbe1N1b33di08Ww40" +
                      "/Cancelados/" + whatsApp).set(null);
                    }
                  }
                  if (cancelou) {
                    countCancelados+=1;

                  // enviar
                  } else {
                    // console.log("enviou " + pacAEnviar[1].Paciente);
                    db.ref("OFT/45/campanha/palpebra/aEnviarOnWrite").
                        push(pacAEnviar[1]);
                    pacAEnviar[1].DataEnvio = todayDate;
                    enviadosFiltrado[pacAEnviar[0]] = pacAEnviar[1];
                    count+=1;
                  }
                }
              }
            });
            console.log("Cancelados: " + countCancelados);
            console.log("Ja enviados no ultimo mes: " + countEnviados);
            console.log("Ultimo Ano: " + countUltimoAno);
            console.log("Agendados: " + countAgendados);
            console.log("Enviados Filtrado: " + countEnviadosFiltrado);
            console.log("Lidos: " + countLidos);
            console.log("Enviados com sucesso: " + count);

            // não salvar no nó
            // if (ambiente === "producao") {
            db.ref("OFT/45/campanha/palpebra/enviados").
                set(enviadosFiltrado);
            // }

            // resp.end("Ok"+resp.status.toString());
            return null;
          });
        });
      } catch (err) {
        // ... error checks
        console.log("Erro try: " + JSON.stringify(err));
      }
    });


exports.oft45CampanhaPalpebraZApi =
      functions.database.ref("OFT/45/campanha/palpebra/aEnviarOnWrite/{pushId}")
          .onWrite((change, context) => {
            // Only edit data when it is first created.
            // if (change.before.exists()) {
            // return null;
            // }
            // Exit when the data is deleted.
            if (!change.after.exists()) {
              return null;
            }
            // const db = admin.database();
            // Grab the current value of what was written to the RT Database
            const element = change.after.val();
            console.log(JSON.stringify(element));
            let paciente = "";
            if (element.Paciente) {
              paciente = element.Paciente;
            }
            let whatsAppCel;
            if (element.Telefone) {
              whatsAppCel = tel2Whats(element.Telefone);
            }
            // let dataNascimento;
            // if (element.Nascimento) {
            //   dataNascimento = element.Nascimento;
            // }
            // const message1Aux = whatsAppCel;

            if (ambiente == "teste") whatsAppCel = "5521971938840"; // gabriel

            if (whatsAppCel) {
              let parametros = {};
              if (ambiente == "teste") {
                parametros = {
                  whatsAppCel: whatsAppCel,
                  id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                  token: "A8F754F1402CAE3625D5D578",
                  // buttonList: buttonList,
                };
              } else {
                parametros = {
                  whatsAppCel: whatsAppCel,
                  id: "39C7A89881E470CC246252059E828D91",
                  token: "B1CA83DE10E84496AECE8028",
                  // buttonList: buttonList,
                };
              }

              // CAMPANHA CATARATA

              // let message1 = "Campanha OFTALMO DAY" +
              // "\nAção Social 'Tire suas dúvidas sobre CATARATA'" +
              // "\n\nOlá "+ paciente + ", tudo bem?" +
              // "\nNo dia 23 de setembro de 2023, às 9h, na Clínica Oftalmo " +
              // "Day - Dr Antonio Lobo, faremos um evento especial, com " +
              // "qualidade e conforto." +
              // "\nNossos médicos especialistas, estarão à disposição " +
              // "para esclarecer todas as suas dúvidas sobre a CATARATA." +
              // "\n\nSerá uma manhã muito agradável, com um delicioso " +
              // "café da manhã " +
              // "\nE o melhor, o único pagamento exigido é 1 kg de " +
              // "alimento não perecível." +
              // "\n\nPara agendar sua participação basta responder " +
              // "QUERO PARTICIPAR nessa mensagem " +
              // "ou entre em contato pelo telefone: (21) 3872-6161";

              // "\n\nEntre em contato com a gente pelo telefone " +
              // "(21) 3872-6161, pelo WhatsApp (21) 99493-1662 ou " +
              // "clique no link abaixo para agendar sua participação:" +
              // "\n\nhttps://is.gd/WwKBNp";


              // CAMPANHA GLAUCOMA

              // const message1 = "Olá "+ paciente + ", tudo bem?" +
              // "\n\nNo *dia 02/03 das 9:00 às 12:00*
              // iremos realizar novamente o "+
              // "evento sobre a *Prevenção do Glaucoma*." +
              // "\n*Esse evento é gratuito*." +
              // "\nTeremos na clínica 4 médicos especialistas em  Glaucoma " +
              // "para poder verificar sua pressão ocular, esclarecer todas " +
              // "as suas dúvidas, tratamentos disponíveis , os riscos do " +
              // "glaucoma e a importância do
              // acompanhamento médico oftalmológico." +
              // "\n\nSerá uma manhã muito agradável, " +
              // "com um delicioso café da " +
              // "manhã" +
              // "\nVenha participar!!" +
              // "\nVocê é nosso convidado!!" +
              // "\n\nBastar dizer: EU QUERO PARTICIPAR que agendaremos a " +
              // "sua participação";

              // CAMPANHA CIRURGIA

              const emojiUse1 = emoji.get("thinking"); // 🤔
              const emojiUse2 = emoji.get("smile"); // 😄
              const emojiUse3 = emoji.get("wink"); // 😉

              const message1 = "*SUA PÁLPEBRA MAIS BONITA!*" +
              "\nOlá " + paciente + ". Tudo bem?" +
              "\n\nO seu olhar está com aspecto de cansado? " +
              "A sobra de pele da pálpebra te incomoda? " + emojiUse1 +
              "\n\nVocê que já é nosso paciente pode ter o olhar descansado " +
              "novamente através de uma pequena cirurgia *com preços mais " +
              "acessíveis em até 12x* e ainda " +
              "melhorar as rugas ao redor dos olhos com peeling." +
              emojiUse2 +
               "\n\nPara mais informações, basta escrever QUERO SABER MAIS! " +
               emojiUse3;

              // if (ambiente === "teste") {
              //   message1 = message1Aux + " > " + paciente +
              //   + " " + dataNascimento +
              //   " -> " + message1;
              // }

              const arrUrls = [message1];
              const arrMessageType = ["text"];
              const i = 0;
              callZapiV2(arrUrls, arrMessageType, parametros, i);
            }

            // return null;
          });


// CAMPANHA GERAL
const oft45NomeCampanha = "retina";

// RETINA AVISO

exports.oft45CampanhaRetinaAvisocriarNo = functions.https.
    onRequest((req, resp) => {
      console.log("Entrou no criar nó oft45CampanhaRetinaAvisocriarNo");
      const db = admin.database();
      db.ref("OFT/45/campanha/"+ oft45NomeCampanha +
         "/avisoPaciente/aEnviarOnWrite").set(true);
      resp.end("Ok\n"+resp.status.toString());
    });


exports.oft45CampanhaRetinaAvisoJson = functions.https.
    onRequest((req, resp) => {
      console.log("Entrou Função oft45CampanhaRetinaAvisoJson");
      const today = new Date();
      // const year = today.getFullYear();
      // const mm = today.getMonth()+1;
      // const dd = today.getDate();
      const diaDaSemana = today.getDay();
      if (diaDaSemana != 0 && diaDaSemana != 6 ) {
        try {
          // make sure that any items are correctly
          // URL encoded in the connection string
          // console.log("Entrou try");
          return sqlConnection.connect(sqlConfig).then((pool) => {
            // pool.sqlConnection.connect(sqlConfig);
            // console.log("Entrou connect");

            let sql = "";
            sql = "SELECT * ";
            sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
            sql = sql + "WHERE  DataMarcada >= '2024-06-29' ";
            sql = sql + "AND  DataMarcada < '2024-06-30' ";
            sql = sql + "ORDER BY DataMarcada";

            return pool.query(sql);
            // const result = pool.query(sql);
          }).then((result) => {
            const db = admin.database();
            const ref = db
                .ref("OFT/45/campanha/"+ oft45NomeCampanha +
                    "/avisoPaciente/aEnviarOnWrite");
            result.recordset.forEach((element) => {
              /*
              const year = element.DataMarcada.substring(0, 3);
              const mm = element.DataMarcada.substring(5, 6);
              const dd = element.DataMarcada.substring(8, 9);
              const hh = element.DataMarcada.substring(11, 12);
              const min = element.DataMarcada.substring(14, 15);
              */
              const year = element.DataMarcada.getFullYear();
              const mm = element.DataMarcada.getMonth()+1;
              const dd = element.DataMarcada.getDate();
              const hh = element.DataMarcada.getHours();
              let min = element.DataMarcada.getMinutes();
              if (min == 0 ) {
                min = "00";
              }
              const dataMarcada = dd + "/" + mm + "/" +
                year + "  " + hh + ":" + min;
              element.DataMarcada = dataMarcada;
              ref.push(element);
            });
            resp.end("Ok"+resp.status.toString());
            // ref.set(true);
            // return null;
          });
        } catch (err) {
          // ... error checks
          console.log("Erro try: " + JSON.stringify(err));
        }
      }
    });


exports.oft45CampanhaRetinaAvisoZApi = functions.database
    .ref("OFT/45/campanha/"+ oft45NomeCampanha +
        "/avisoPaciente/aEnviarOnWrite/{pushId}")
    .onWrite((change, context) => {
      // Only edit data when it is first created.
      // if (change.before.exists()) {
      // return null;
      // }
      // Exit when the data is deleted.
      if (!change.after.exists()) {
        return null;
      }
      const db = admin.database();
      // Grab the current value of what was written to the Realtime Database
      const element = change.after.val();
      console.log(JSON.stringify(element));
      // const endereco = "Praça Saenz Pena 45, sala 1508 - Tijuca";
      // console.log("forEach. element:" + JSON.stringify(element));
      let paciente = "";
      let dataMarcada = "";
      let telCom = "";
      let telRes = "";
      let tel = "";
      let telCel = "";
      // let IDMarcacao = "";
      if (element.Paciente) {
        paciente = element.Paciente;
      }
      if (element.DataMarcada) {
        dataMarcada = element.DataMarcada;
      }

      // if (element.IDMarcacao) {
      //   IDMarcacao = element.IDMarcacao;
      // }

      if (element.TelefoneCom) {
        telCom = element.TelefoneCom.replace("(", "");
        telCom = telCom.replace(")", "");
        telCom = telCom.replace(".", "");
        telCom = telCom.replace(" ", "");
        telCom = telCom.replace("-", "");
        telCom = telCom.replace("-", "");
        // console.log("element.TelefoneCom: " + element.TelefoneCom);
        // console.log("telCom: " + telCom);
      }
      if (element.TelefoneCel) {
        telCel = element.TelefoneCel.replace("(", "");
        telCel = telCel.replace(")", "");
        telCel = telCel.replace(".", "");
        telCel = telCel.replace(" ", "");
        telCel = telCel.replace("-", "");
        telCel = telCel.replace("-", "");
        // console.log("element.TelefoneCel: " + element.TelefoneCel);
        // console.log("telCel: " + telCel);
      }
      if (element.TelefoneRes) {
        telRes = element.TelefoneRes.replace("(", "");
        telRes = telRes.replace(")", "");
        telRes = telRes.replace(".", "");
        telRes = telRes.replace(" ", "");
        telRes = telRes.replace("-", "");
        telRes = telRes.replace("-", "");
        // console.log("element.TelefoneRes: " + element.TelefoneRes);
        // console.log("telRes: " + telRes);
      }
      if (element.Telefone) {
        tel = element.Telefone.replace("(", "");
        tel = tel.replace(")", "");
        tel = tel.replace(".", "");
        tel = tel.replace(" ", "");
        tel = tel.replace("-", "");
        tel = tel.replace("-", "");
        // console.log("element.Telefone: " + element.Telefone);
        // console.log("tel: " + tel);
      }
      let whatsAppCel = "";
      if (tel&&(tel.substring(2, 3) == "9")) {
        whatsAppCel = "55" + tel;
      } else if ((telCel)&&(telCel.substring(2, 3) == "9")) {
        whatsAppCel = "55" + telCel;
      } else if ((telRes)&&(telRes.substring(2, 3) == "9")) {
        whatsAppCel = "55" + telRes;
      } else if ((telCom)&&(telCom.substring(2, 3) == "9")) {
        whatsAppCel = "55" + telCom;
      }
      const whatsAppCelPaciente = whatsAppCel;
      if (ambiente == "teste") whatsAppCel = "5521971938840";

      // console.log("whatsAppCel: " + whatsAppCel);
      if (whatsAppCel) {
        // dd/mm/yyyy hh:mm
        const year = dataMarcada.split("/")[2].split(" ")[0];
        const mm = dataMarcada.split("/")[1];
        const dd = dataMarcada.split("/")[0];
        // const hh = dataMarcada.substring(9, 10);
        // const min = dataMarcada.substring(12, 13);

        let message1 = "Bom dia " + paciente +" !"+
        "\n\nGostaríamos de passar algumas informações sobre " +
        "sua participação no evento *Prevenção à Retinopatia " +
        "Diabética*, que ocorrerá no dia 29/06." +
        "\nSerá feito o *exame de mapeamento " +
        "de retina*, para verificar detalhadamente a estrutura " +
        "interna do fundo do olho." +
        "\n*Esse exame possui dilatação da pupila, aconselhamos " +
        "vir acompanhado e não dirigir.*" +
        "\nCaso não tenha acompanhante, pedimos para aguardar " +
        "na clínica até a melhora da sua visão." +
         "\n\n*Estamos ansiosos para cuidar da saúde dos seus " +
         "olhos. Conte conosco para oferecer o melhor " +
         "atendimento oftalmológico.*";

        if (ambiente == "teste") {
          message1 = whatsAppCelPaciente + "\n" + message1;
        }

        const postData = JSON.stringify({
          "phone": whatsAppCel,
          "message": message1,

        });
        const req = new XMLHttpRequest();
        let urlZapi = "";

        if (ambiente == "teste") {
          urlZapi = "https://api.z-api.io/instances/" +
          "3B74CE9AFF0D20904A9E9E548CC778EF/token/" +
          "A8F754F1402CAE3625D5D578/send-text";
        } else {
          urlZapi = "https://api.z-api.io/instances/" +
          "39C7A89881E470CC246252059E828D91/token/" +
          "B1CA83DE10E84496AECE8028/send-text";
        }
        req.open("POST", urlZapi, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.onerror = () => {
          console.log("Entrou onerror: " + req.statusText);
        };
        req.onload = () => {
          console.log("Entrou onload. req.status: " + req.status);
          if (req.status == 200) {
            console.log("Z-API chamado com sucesso: " + whatsAppCel);
            console.log(year+"/"+mm+"/"+dd);
            const pushID = context.params.pushId;
            const refAEnviar = db
                .ref("OFT/45/campanha/"+ oft45NomeCampanha +
                  "/avisoPaciente/aEnviarOnWrite/" + pushID);
            refAEnviar.set(null);
          } else {
            console.log("Erro chamando Z-API.");
          }
        };
        // setTimeout(function() {
        // req.send(postData);
        // }, 500);
        req.send(postData);
        console.log("req.send(postData): " + postData);
        // });
      }
      // You must return a Promise when performing
      // asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling
      // in the Realtime Database returns a Promise.
      return null;
    });


exports.oft45CampanhaRetinaCriarNo = functions.https.
    onRequest((req, resp) => {
      console.log("Entrou no criar nó");
      const db = admin.database();
      db.ref("OFT/45/campanha/"+ oft45NomeCampanha +
          "/aEnviarOnWrite").set(true);
      db.ref("OFT/45/campanha/"+ oft45NomeCampanha +
          "/pacientesCompleto/").set(true);
      db.ref("OFT/45/campanha/"+ oft45NomeCampanha +
        "/enviados/").set(true);
      db.ref("OFT/45/campanha/"+ oft45NomeCampanha +
          "/configuracoes/quantidadeEnvio/")
          .set(true);
      resp.end("Ok\n"+resp.status.toString());
    });


exports.oft45CampanhaRetinaCargaMensal = functions
    .runWith({timeoutSeconds: 540}).https.
    onRequest((req, resp) => {
    // exports.oft45CampanhaRetinaCargaMensal = functions.pubsub
    //     .schedule("31 17 22 * *")
    //     .timeZone("America/Sao_Paulo") // Users can choose timezone
    //     .onRun((context) => {
      const dbRef = admin.database();

      dbRef.ref("OFT/45/campanha/" + oft45NomeCampanha +
          "/pacientesCompleto").set(null)
          .then(() => {
            return sqlConnection.connect(sqlConfig).then((pool) => {
              const dbRef = admin.database();

              let queryBuscaAtiva = "";
              queryBuscaAtiva = "SELECT CodPaciente, Paciente, ";
              queryBuscaAtiva = queryBuscaAtiva + "DataAtendimento, ";
              queryBuscaAtiva = queryBuscaAtiva + "Convenio, ";
              queryBuscaAtiva = queryBuscaAtiva + "Medico, Telefone, ";
              queryBuscaAtiva = queryBuscaAtiva + "IDItem, Item, Nascimento ";
              queryBuscaAtiva = queryBuscaAtiva + "FROM dbo.vw_Excel";
              queryBuscaAtiva = queryBuscaAtiva + "_Sis_Atendimento";
              queryBuscaAtiva = queryBuscaAtiva + "_Campanhas_45";
              queryBuscaAtiva = queryBuscaAtiva + " WHERE (CodPaciente ";
              queryBuscaAtiva = queryBuscaAtiva + "IS NOT NULL) ";
              queryBuscaAtiva = queryBuscaAtiva + "AND (Nascimento < ";
              queryBuscaAtiva = queryBuscaAtiva + "CONVERT(DATETIME, ";
              queryBuscaAtiva = queryBuscaAtiva + "'1994-01-01 00:00:00', ";
              queryBuscaAtiva = queryBuscaAtiva + "102)) ";
              queryBuscaAtiva = queryBuscaAtiva + "AND (DataAtendimento < ";
              queryBuscaAtiva = queryBuscaAtiva + "CONVERT(DATETIME, ";
              queryBuscaAtiva = queryBuscaAtiva + "'2023-09-23 00:00:00', ";
              queryBuscaAtiva = queryBuscaAtiva + "102)) ";

              return pool.request().query(queryBuscaAtiva, (err, result) => {
                let codPac = "";
                // let strPar = "{";
                const buscaAtivaJson = {};
                result.recordset.forEach((element) => {
                  if (element.CodPaciente && element.Telefone &&
                    tel2Whats(element.Telefone)) {
                    // codPac = JSON.stringify("codPac_"
                    // +element.CodPaciente+"_"+
                    //   tel2Whats(element.Telefone));
                    // strPar += codPac+":"+JSON.stringify(element)+",";
                    codPac = "codPac_"+element.CodPaciente+"_"+
                      tel2Whats(element.Telefone);
                    const strData = JSON.stringify(element.DataAtendimento);
                    element.DataAtendimento = JSON.parse(strData);
                    buscaAtivaJson[codPac] = element;
                  }
                });
                // strPar = strPar.slice(0, -1) + "}";
                // console.log(strPar);
                // const buscaAtivaJson = JSON.parse(strPar);

                dbRef.ref("OFT/45/campanha/"+ oft45NomeCampanha +
                      "/pacientesCompleto").set(buscaAtivaJson);
                resp.end("Ok"+resp.status.toString());
                // return null;
              });
            });
          });
    });


// exports.oft45CampanhaRetinaJson = functions.runWith({timeoutSeconds: 540})
//     .https.onRequest((req, resp) => {
exports.oft45CampanhaRetinaJson = functions.pubsub
    .schedule("00 10 * * 1-5")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou no oft45CampanhaRetinaJson");

      const promises = [];
      let monthEnvio;
      let dayEnvio;
      let dataEnvio;
      let yearEnvio;
      let sendDate;
      const today = new Date();
      const todayDate = today.getDate()+"/"+(today.getMonth()+1)+"/"+
      today.getFullYear();
      const db = admin.database();
      db.ref("OFT/45/campanha/"+ oft45NomeCampanha +
          "/aEnviarOnWrite").set(true);

      try {
        return sqlConnection.connect(sqlConfig).then((pool) => {
          console.log("Entrou connect");
          promises.push(db.ref("OFT/45/campanha/"+ oft45NomeCampanha +
            "/pacientesCompleto/").once("value"));
          promises.push(db.ref("OFT/45/campanha/"+ oft45NomeCampanha +
            "/enviados/").once("value"));
          promises.push(db.ref("OFT/45/campanha/"+ oft45NomeCampanha +
              "/configuracoes/quantidadeEnvio/").once("value"));
          promises.push(oft45CanceladosAll());
          return Promise.all(promises).then((res) => {
            console.log("Entrou Promise");
            // Armazenamento leitura dos DB
            // const agendados = res[0].recordsets[0];
            // const ultimoAno = res[0].recordsets[1];
            const aEnviar = res[0].val();
            const enviados = res[1].val();
            const quantidadeEnvio = res[2].val();
            const cancelados = res[3];

            // Processamento dos Enviados
            // Remoção de pacientes enviados há mais de 1 mês
            const entriesEnviados = Object.entries(enviados);
            const entriesAEnviar = Object.entries(aEnviar);
            // const entriesCancelados = Object.entries(cancelados);
            const enviadosFiltrado = {};
            let countEnviadosFiltrado = 0;
            // Cancelados
            // console.log("CanceladosAll: "+JSON.stringify(cancelados));
            // Retirar enviados há mais de um mês
            entriesEnviados.forEach((element) => {
              dataEnvio = element[1].DataEnvio;
              dayEnvio = dataEnvio.split("/")[0];
              monthEnvio = dataEnvio.split("/")[1];
              yearEnvio = dataEnvio.split("/")[2];
              sendDate = new Date(monthEnvio+"/"+
                dayEnvio+"/"+yearEnvio);
              sendDate.setDate(sendDate.getDate()+30);
              if (sendDate>today) {
                countEnviadosFiltrado+=1;
                enviadosFiltrado[element[0]] = element[1];
              }
            });
            console.log("Passou For Each Enviados");

            // Filtrando a Enviar
            const entriesEnviadosFiltrados = Object.entries(enviadosFiltrado);
            let count = 0;
            let countLidos = 0;
            const countAgendados = 0;
            const countUltimoAno = 0;
            let countEnviados = 0;
            let countCancelados = 0;

            const dataAtualAux = new Date();
            const dataAtual = JSON.stringify(dataAtualAux);
            // Lê entriesAEnviar do fim pro inicio
            entriesAEnviar.slice().forEach((pacAEnviar)=>{
              countLidos+=1;
              if (count<quantidadeEnvio) {
                // // agendados
                // if (agendados.some((pacAgendado) =>
                //   pacAgendado.CodPaciente==pacAEnviar[1].CodPaciente)) {
                //   // countAgendados+=1;
                //   // console.log("agendado " + pacAEnviar[1].Paciente);

                // // ultimo ano
                // } else if (ultimoAno.some((pacUltimoAno) =>
                //   pacUltimoAno.CodPaciente==pacAEnviar[1].CodPaciente)) {
                //   // countUltimoAno+=1;
                //   // console.log("ultimo ano " + pacAEnviar[1].Paciente); */

                // enviados
                if (entriesEnviadosFiltrados.some((pacEnviado) =>
                  pacEnviado[1].CodPaciente==pacAEnviar[1].CodPaciente)) {
                  countEnviados+=1;
                  // console.log("ja enviado " + pacAEnviar[1].Paciente);

                // cancelados
                } else {
                  let cancelou = false;
                  const whatsApp = tel2Whats(pacAEnviar[1].Telefone)
                      .substring(2, 13);
                  // console.log("whatsapp " + whatsApp);
                  if (cancelados[whatsApp]) {
                    const pacCanc = cancelados[whatsApp];
                    if ((pacCanc.Reenviar.toString() == "") ||
                      (JSON.stringify(pacCanc.Reenviar) > dataAtual)) {
                      cancelou = true;
                    } else {
                      // db.ref("OFT/45/buscaAtiva/ Cancelados/" +
                      // whatsApp).set(null);
                      db.ref("/OFT/45/_dadosComuns/cancelados/automatico/" +
                      whatsApp).set(null);
                      db.ref("/OFT/45/_dadosComuns/cancelados/" +
                      "1jApb1NOrMYoLce8MKxkUSLBpwEXbe1N1b33di08Ww40" +
                      "/Cancelados/" + whatsApp).set(null);
                    }
                  }
                  if (cancelou) {
                    countCancelados+=1;

                  // enviar
                  } else {
                    // console.log("enviou " + pacAEnviar[1].Paciente);
                    db.ref("OFT/45/campanha/"+
                        oft45NomeCampanha +"/aEnviarOnWrite").
                        push(pacAEnviar[1]);
                    pacAEnviar[1].DataEnvio = todayDate;
                    enviadosFiltrado[pacAEnviar[0]] = pacAEnviar[1];
                    count+=1;
                  }
                }
              }
            });
            console.log("Cancelados: " + countCancelados);
            console.log("Ja enviados no ultimo mes: " + countEnviados);
            console.log("Ultimo Ano: " + countUltimoAno);
            console.log("Agendados: " + countAgendados);
            console.log("Enviados Filtrado: " + countEnviadosFiltrado);
            console.log("Lidos: " + countLidos);
            console.log("Enviados com sucesso: " + count);

            // não salvar no nó
            // if (ambiente === "producao") {
            db.ref("OFT/45/campanha/"+ oft45NomeCampanha +"/enviados")
                .set(enviadosFiltrado);
            // }

            // resp.end("Ok"+resp.status.toString());
            return null;
          });
        });
      } catch (err) {
        // ... error checks
        console.log("Erro try: " + JSON.stringify(err));
      }
    });


exports.oft45CampanhaRetinaZApi =
    functions.database.ref("OFT/45/campanha/"+ oft45NomeCampanha +
        "/aEnviarOnWrite/{pushId}")
        .onWrite((change, context) => {
          // Only edit data when it is first created.
          // if (change.before.exists()) {
          // return null;
          // }
          // Exit when the data is deleted.
          if (!change.after.exists()) {
            return null;
          }
          // const db = admin.database();
          // Grab the current value of what was written to the RT Database
          const element = change.after.val();
          console.log(JSON.stringify(element));
          let paciente = "";
          if (element.Paciente) {
            paciente = element.Paciente;
          }
          let whatsAppCel;
          if (element.Telefone) {
            whatsAppCel = tel2Whats(element.Telefone);
          }
          // let dataNascimento;
          // if (element.Nascimento) {
          //   dataNascimento = element.Nascimento;
          // }
          // const message1Aux = whatsAppCel;

          if (ambiente == "teste") whatsAppCel = "5521971938840"; // gabriel

          if (whatsAppCel) {
            let parametros = {};
            if (ambiente == "teste") {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                token: "A8F754F1402CAE3625D5D578",
                // buttonList: buttonList,
              };
            } else {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "39C7A89881E470CC246252059E828D91",
                token: "B1CA83DE10E84496AECE8028",
                // buttonList: buttonList,
              };
            }

            // CAMPANHA RETINA

            const message1 = "*PREVENÇÃO À RETINOPATIA  - AVALIAÇÃO GRATUITA*" +
            "\n\nOlá "+ paciente + ", tudo bem?" +
            "\n\nNo *dia 29 de Junho das 8:00 às 11:00* faremos um  " +
            "evento sobre a *Prevenção a Retinopatia Diabética*." +
            "\n*Esse evento é gratuito*." +
            "\nTeremos na clínica 3 médicos especialistas em retina " +
            "para poder avaliar sua retina, " +
            "esclarecer todas " +
            "as suas dúvidas, tratamentos disponíveis " +
            "e a importância do acompanhamento médico oftalmológico." +
            "\nTraga seus familiares e amigos!" +
            "\n\nPara agendar sua participação basta responder " +
            "QUERO PARTICIPAR nessa mensagem " +
            "ou entre em contato pelo telefone: (21) 3872-6161";


            // CAMPANHA PALPEBRA

            // const emojiUse1 = emoji.get("thinking"); // 🤔
            // const emojiUse2 = emoji.get("smile"); // 😄
            // const emojiUse3 = emoji.get("wink"); // 😉

            // const message1 = "*SUA PÁLPEBRA MAIS BONITA!*" +
            // "\nOlá " + paciente + ". Tudo bem?" +
            // "\n\nO seu olhar está com aspecto de cansado? " +
            // "A sobra de pele da pálpebra te incomoda? " + emojiUse1 +
            // "\n\nVocê que já é nosso paciente pode ter o olhar " +
            // " descansado " +
            // "novamente através de uma pequena cirurgia *com preços mais " +
            // "acessíveis em até 12x* e ainda " +
            // "melhorar as rugas ao redor dos olhos com peeling." +
            // emojiUse2 +
            // "\n\nPara mais informações, basta escrever QUERO SABER MAIS! " +
            //   emojiUse3;

            // if (ambiente === "teste") {
            //   message1 = message1Aux + " > " + paciente +
            //   + " " + dataNascimento +
            //   " -> " + message1;
            // }
            const arrUrls = [message1];
            const arrMessageType = ["text"];
            const i = 0;
            callZapiV2(arrUrls, arrMessageType, parametros, i);
          }

          // return null;
        });

exports.oft45CampanhaRetinaConfirmacaocriarNo = functions.https.
    onRequest((req, resp) => {
      console.log("Entrou no criar nó");
      const db = admin.database();
      db.ref("OFT/45/campanha/"+ oft45NomeCampanha +
         "/confirmacaoPaciente/aEnviarOnWrite").set(true);
      resp.end("Ok\n"+resp.status.toString());
    });


exports.oft45CampanhaRetinaConfirmacaoJson = functions.https.
    onRequest((req, resp) => {
      console.log("Entrou Função oft45CampanhaRetinaConfirmacaoJson");
      const today = new Date();
      // const year = today.getFullYear();
      // const mm = today.getMonth()+1;
      // const dd = today.getDate();
      const diaDaSemana = today.getDay();
      if (diaDaSemana != 0 && diaDaSemana != 6 ) {
        try {
          // make sure that any items are correctly
          // URL encoded in the connection string
          // console.log("Entrou try");
          return sqlConnection.connect(sqlConfig).then((pool) => {
            // pool.sqlConnection.connect(sqlConfig);
            // console.log("Entrou connect");

            let sql = "";
            sql = "SELECT * ";
            sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
            sql = sql + "WHERE  DataMarcada >= '2024-06-29' ";
            sql = sql + "AND  DataMarcada < '2024-06-30' ";
            sql = sql + "ORDER BY DataMarcada";

            return pool.query(sql);
            // const result = pool.query(sql);
          }).then((result) => {
            const db = admin.database();
            const ref = db
                .ref("OFT/45/campanha/"+ oft45NomeCampanha +
                    "/confirmacaoPaciente/aEnviarOnWrite");
            result.recordset.forEach((element) => {
              /*
              const year = element.DataMarcada.substring(0, 3);
              const mm = element.DataMarcada.substring(5, 6);
              const dd = element.DataMarcada.substring(8, 9);
              const hh = element.DataMarcada.substring(11, 12);
              const min = element.DataMarcada.substring(14, 15);
              */
              const year = element.DataMarcada.getFullYear();
              const mm = element.DataMarcada.getMonth()+1;
              const dd = element.DataMarcada.getDate();
              const hh = element.DataMarcada.getHours();
              let min = element.DataMarcada.getMinutes();
              if (min == 0 ) {
                min = "00";
              }
              const dataMarcada = dd + "/" + mm + "/" +
                year + "  " + hh + ":" + min;
              element.DataMarcada = dataMarcada;
              ref.push(element);
            });
            resp.end("Ok"+resp.status.toString());
            // ref.set(true);
            // return null;
          });
        } catch (err) {
          // ... error checks
          console.log("Erro try: " + JSON.stringify(err));
        }
      }
    });


exports.oft45CampanhaRetinaConfirmacaoZApi = functions.database
    .ref("OFT/45/campanha/"+ oft45NomeCampanha +
        "/confirmacaoPaciente/aEnviarOnWrite/{pushId}")
    .onWrite((change, context) => {
      // Only edit data when it is first created.
      // if (change.before.exists()) {
      // return null;
      // }
      // Exit when the data is deleted.
      if (!change.after.exists()) {
        return null;
      }
      const db = admin.database();
      // Grab the current value of what was written to the Realtime Database
      const element = change.after.val();
      console.log(JSON.stringify(element));
      // const endereco = "Praça Saenz Pena 45, sala 1508 - Tijuca";
      // console.log("forEach. element:" + JSON.stringify(element));
      let paciente = "";
      let dataMarcada = "";
      let telCom = "";
      let telRes = "";
      let tel = "";
      let telCel = "";
      // let IDMarcacao = "";
      if (element.Paciente) {
        paciente = element.Paciente;
      }
      if (element.DataMarcada) {
        dataMarcada = element.DataMarcada;
      }

      // if (element.IDMarcacao) {
      //   IDMarcacao = element.IDMarcacao;
      // }

      if (element.TelefoneCom) {
        telCom = element.TelefoneCom.replace("(", "");
        telCom = telCom.replace(")", "");
        telCom = telCom.replace(".", "");
        telCom = telCom.replace(" ", "");
        telCom = telCom.replace("-", "");
        telCom = telCom.replace("-", "");
        // console.log("element.TelefoneCom: " + element.TelefoneCom);
        // console.log("telCom: " + telCom);
      }
      if (element.TelefoneCel) {
        telCel = element.TelefoneCel.replace("(", "");
        telCel = telCel.replace(")", "");
        telCel = telCel.replace(".", "");
        telCel = telCel.replace(" ", "");
        telCel = telCel.replace("-", "");
        telCel = telCel.replace("-", "");
        // console.log("element.TelefoneCel: " + element.TelefoneCel);
        // console.log("telCel: " + telCel);
      }
      if (element.TelefoneRes) {
        telRes = element.TelefoneRes.replace("(", "");
        telRes = telRes.replace(")", "");
        telRes = telRes.replace(".", "");
        telRes = telRes.replace(" ", "");
        telRes = telRes.replace("-", "");
        telRes = telRes.replace("-", "");
        // console.log("element.TelefoneRes: " + element.TelefoneRes);
        // console.log("telRes: " + telRes);
      }
      if (element.Telefone) {
        tel = element.Telefone.replace("(", "");
        tel = tel.replace(")", "");
        tel = tel.replace(".", "");
        tel = tel.replace(" ", "");
        tel = tel.replace("-", "");
        tel = tel.replace("-", "");
        // console.log("element.Telefone: " + element.Telefone);
        // console.log("tel: " + tel);
      }
      let whatsAppCel = "";
      if (tel&&(tel.substring(2, 3) == "9")) {
        whatsAppCel = "55" + tel;
      } else if ((telCel)&&(telCel.substring(2, 3) == "9")) {
        whatsAppCel = "55" + telCel;
      } else if ((telRes)&&(telRes.substring(2, 3) == "9")) {
        whatsAppCel = "55" + telRes;
      } else if ((telCom)&&(telCom.substring(2, 3) == "9")) {
        whatsAppCel = "55" + telCom;
      }
      const whatsAppCelPaciente = whatsAppCel;
      if (ambiente == "teste") whatsAppCel = "5521971938840";

      // console.log("whatsAppCel: " + whatsAppCel);
      if (whatsAppCel) {
        // dd/mm/yyyy hh:mm
        const year = dataMarcada.split("/")[2].split(" ")[0];
        const mm = dataMarcada.split("/")[1];
        const dd = dataMarcada.split("/")[0];
        // const hh = dataMarcada.substring(9, 10);
        // const min = dataMarcada.substring(12, 13);

        let message1 = "Bom dia " + paciente + " !" +
        "\nSomos da clínica Oftalmo Day Dr. Antonio Lobo." +
        "\n\nGostaríamos de passar algumas informações " +
        "sobre sua participação no evento *Prevenção à " +
        "Retinopatia Diabética*, que ocorrerá no dia 29/06 (sábado)." +
        "\nSerá feito o *exame de mapeamento de retina*, para " +
        "verificar detalhadamente a estrutura interna do fundo " +
        "do olho." +
        "\n*Esse exame possui dilatação da pupila, aconselhamos " +
        "vir acompanhado e não dirigir.*" +
        "\nCaso não tenha acompanhante, pedimos para aguardar " +
        "na clínica até a melhora da sua visão." +
        "\n\nPodemos confirmar sua participação?";

        if (ambiente == "teste") {
          message1 = whatsAppCelPaciente + "\n" + message1;
        }

        const postData = JSON.stringify({
          "phone": whatsAppCel,
          "message": message1,

        });
        const req = new XMLHttpRequest();
        let urlZapi = "";

        if (ambiente == "teste") {
          urlZapi = "https://api.z-api.io/instances/" +
          "3B74CE9AFF0D20904A9E9E548CC778EF/token/" +
          "A8F754F1402CAE3625D5D578/send-text";
        } else {
          urlZapi = "https://api.z-api.io/instances/" +
          "39C7A89881E470CC246252059E828D91/token/" +
          "B1CA83DE10E84496AECE8028/send-text";
        }
        req.open("POST", urlZapi, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.onerror = () => {
          console.log("Entrou onerror: " + req.statusText);
        };
        req.onload = () => {
          console.log("Entrou onload. req.status: " + req.status);
          if (req.status == 200) {
            console.log("Z-API chamado com sucesso: " + whatsAppCel);
            console.log(year+"/"+mm+"/"+dd);
            const pushID = context.params.pushId;
            const refAEnviar = db
                .ref("OFT/45/campanha/"+ oft45NomeCampanha +
                  "/confirmacaoPaciente/aEnviarOnWrite/" + pushID);
            refAEnviar.set(null);
          } else {
            console.log("Erro chamando Z-API.");
          }
        };
        // setTimeout(function() {
        // req.send(postData);
        // }, 500);
        req.send(postData);
        console.log("req.send(postData): " + postData);
        // });
      }
      // You must return a Promise when performing
      // asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling
      // in the Realtime Database returns a Promise.
      return null;
    });


// exports.lerCanceladosEscreverNovoCancelados = functions.https
//     .onRequest((req, resp) => {
//       // cancelados planilha
//       // const refCanceladosPlanilha = admin.database()
//       //     .ref("OFT/45/buscaAtiva/cancelados");
//       //  "/1jApb1NOrMYoLce8MKxkUSLBpwEXbe1N1b33di08Ww40/Cancelados");
//       const refNovoCancelados = admin.database()
//           .ref("OFT/45/buscaAtiva/novoCancelados");
//       const refCancelados = admin.database()
//           .ref("OFT/45/buscaAtiva/ Cancelados");
//       // const refDadosComunsCancelados = admin.database()
//       //     .ref("OFT/45/_dadosComuns/cancelados");
//       const refDadosComunsCanceladosAutomatico = admin.database()
//           .ref("OFT/45/_dadosComuns/cancelados/automatico");

//       // criação dos nós que falta no palpebra
//       const quantidadeEnvioPalpebra = admin.database()
//           .ref("OFT/45/palpebra/buscaAtivaPalpebra" +
//             "/configuracoes/quantidadeEnvio");
//       const enviadosPalpebra = admin.database()
//           .ref("/OFT/45/palpebra/buscaAtivaPalpebra/enviados");

//       const promises = [];
//       // promises.push(refCanceladosPlanilha.once("value"));
//       promises.push(refNovoCancelados.once("value"));
//       promises.push(refCancelados.once("value"));
//       return Promise.all(promises).then((res) => {
//         console.log("Entrou Promise");
//         // const objCanceladosPlanilha = res[0].val();
//         // const arrNovoCancelados = res[1].val();
//         // const arrCancelados = res[2].val();
//         const arrNovoCancelados = res[0].val();
//         const arrCancelados = res[1].val();
//         // refDadosComunsCancelados.set(objCanceladosPlanilha);
//         const arrCanceladosFinal =
//           Object.assign(arrNovoCancelados, arrCancelados);
//         // const array3 = array1.concat(array2);
//         refDadosComunsCanceladosAutomatico.set(arrCanceladosFinal);

//         // criação do nó que falta
//         quantidadeEnvioPalpebra.set(100);
//         enviadosPalpebra.set(true);

//         resp.end("Ok"+resp.status.toString());
//       });
//     });

// const runtimeOpts = {
//   timeoutSeconds: 540,
//   memory: "1GB",
// };


// Function para saber se o banco de dados está sendo acessaado
/**
 * Função para verificar se a view contém dados.
 * @return {Promise<void>}
 */
// async function verificarDadosNaView() {
//   try {
//     // Conectar ao banco
//     await sqlConnection.connect(sqlConfig);
//     console.log("✅ Conectado ao banco!");

//     // Executar consulta confirmação/reconfirmação
//     const sql = "SELECT TOP 10 * FROM dbo._vw_GSht_Age_Marcacao_Confirmacao";

// Executar consulta faltosos
// let sql = "SELECT TOP 10 * FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
// sql = sql + "WHERE  IDAtendimento IS NULL ";

//     const result = await sqlConnection.query(sql);

//     if (result.recordset.length > 0) {
//       console.log("📌 A view contém os seguintes dados:", result.recordset);
//     } else {
//       console.log("⚠️ A view está vazia.");
//     }
//   } catch (err) {
//     console.error("❌ Erro ao acessar o banco:", err);
//   } finally {
//     // Fechar conexão para evitar conexões penduradas
//     await sqlConnection.close();
//     console.log("🔌 Conexão fechada.");
//   }
// }


/**
 * Remove duplicatas de IDMarcacao.
 * @constructor
 * @param {Array} dados - Array de objetos contendo os registros do banco.
 * @return {Array} - Retorna os dados filtrados sem duplicatas.
 */
function limparDuplicatasPorIDMarcacao(dados) {
  console.log("Entrou no limparDuplicatasPorIDMarcacao");
  const mapa = new Map();

  dados.forEach((item) => {
    let id = "";
    if (item.IDMarcacao) {
      id = item.IDMarcacao;
    } else {
      id = item.IDMarcacao;
    }

    // Verifica se telefones existe e se é um celular
    const telefoneCelular = (item.Telefone ? tel2Whats(item.Telefone) : "") ||
        (item.TelefoneCel ? tel2Whats(item.TelefoneCel) : "") ||
        (item.TelefoneCom ? tel2Whats(item.TelefoneCom) : "") ||
        (item.TelefoneRes ? tel2Whats(item.TelefoneRes) : "") || "";

    const telefoneCelularExistente = mapa.has(id) ? (
        (mapa.get(id).Telefone ? tel2Whats(mapa.get(id).Telefone) : "") ||
        (mapa.get(id).TelefoneCel ? tel2Whats(mapa.get(id).TelefoneCel) : "") ||
        (mapa.get(id).TelefoneCom ? tel2Whats(mapa.get(id).TelefoneCom) : "") ||
        (mapa.get(id).TelefoneRes ? tel2Whats(mapa.get(id).TelefoneRes) : "") ||
        "") : "";

    if (!mapa.has(id)) {
      mapa.set(id, item);
    } else {
      if (telefoneCelular && !telefoneCelularExistente) {
        mapa.set(id, item); // Substitui pelo que tem celular
      } else if (telefoneCelular && telefoneCelularExistente) {
        // Ambos são celulares, mantém apenas um (o primeiro salvo)
      } else if (!telefoneCelular && !telefoneCelularExistente) {
        // Ambos são fixos, mantém apenas um (o primeiro salvo)
      }
    }
  });
  return Array.from(mapa.values());
}

// exports.oft45ConfirmacaoPacientesCriarNoTeste = functions.https.
//     onRequest((req, resp) => {
//       console.log("Entrou no criar nó");
//       const db = admin.database();
//       db.ref("OFT/45/confirmacaoPacientes/aEnviar")
//           .set(true);
//       db.ref("OFT/45/confirmacaoPacientes/erro")
//           .set(true);
//       resp.end("Ok\n"+resp.status.toString());
//     });


// NOVA FUNÇÃO DE CONFIRMAÇÃO
// exports.oft45ConfirmacaoPacientesJsonV2 = functions
//     .runWith({timeoutSeconds: 540}).https
//     .onRequest(async (req, resp) => {

// 07:00 - 09:59, de 4 em 4 minutos
exports.oft45ConfirmacaoPacientesJsonV2 = functions
    .runWith({timeoutSeconds: 540}).pubsub
    .schedule("*/4 07-09 * * 1-5")
    .timeZone("America/Sao_Paulo")
    .onRun(async (context) => {
      //
      console.log("Entrou Função oft45ConfirmacaoPacientesJsonV2");

      const today = new Date();
      const diaDaSemana = today.getDay();
      const year = today.getFullYear();
      const mm = today.getMonth() + 1;
      const dd = today.getDate();

      const tipoMsg = "confirmacaoPacientes";

      try {
        const pool = await sqlConnection.connect(sqlConfig);
        let sql = "";

        console.log("Entrou connect");

        if (ambiente == "teste") {
          sql = "SELECT * ";
          sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
          sql = sql + "WHERE  DataMarcada >= '2026-01-05' ";
          sql = sql + "AND  DataMarcada < '2026-01-06' ";
          sql = sql + "ORDER BY DataMarcada";
        } else {
          if (diaDaSemana == 4) {
            sql = "SELECT * ";
            sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
            sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 2 + ",";
            sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)) ";
            sql = sql + "AND  DataMarcada < DATEADD(dd," + 5 + ",";
            sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)) ";
            sql = sql + "ORDER BY DataMarcada";
          } else if (diaDaSemana == 5) {
            sql = "SELECT * ";
            sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
            sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 4 + ",";
            sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)) ";
            sql = sql + "AND  DataMarcada < DATEADD(dd," + 5 + ",";
            sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)) ";
            sql = sql + "ORDER BY DataMarcada";
          } else {
            sql = "SELECT * ";
            sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
            sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 2 + ",";
            sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)) ";
            sql = sql + "AND  DataMarcada < DATEADD(dd," + 3 + ",";
            sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)) ";
            sql = sql + "ORDER BY DataMarcada";
          }
        }
        const res = await pool.query(sql);
        const recordset = res.recordset;
        await oft45EnvioMensagensJson(recordset, tipoMsg);
        // resp.end("Ok"+ resp.status.toString() +
        //   "\n\n mensagens enviadas");
        //
      } catch (err) {
        console.error("Erro oft45ConfirmacaoPacientesJsonV2:", err);
        return null;
      }
    //
    });

// NOVA FUNÇÃO DE RECONFIRMAÇÃO
exports.oft45ReconfirmacaoPacientesJsonV2 = functions
    .runWith({timeoutSeconds: 540}).https
    .onRequest(async (req, resp) => {
      // 07:00 - 09:59, de 4 em 4 minutos
      // exports.oft45ReconfirmacaoPacientesJsonV2 = functions
      // .runWith({timeoutSeconds: 540}).pubsub
      // .schedule("*/4 07-09 * * 1-5")
      // .timeZone("America/Sao_Paulo")
      // .onRun(async (context) => {
      //
      console.log("Entrou Função oft45ReconfirmacaoPacientesJsonV2");

      const today = new Date();
      const year = today.getFullYear();
      const mm = today.getMonth() + 1;
      const dd = today.getDate();

      const tipoMsg = "reconfirmacaoPacientes";

      try {
        const pool = await sqlConnection.connect(sqlConfig);
        let sql = "";

        console.log("Entrou connect");

        if (ambiente == "teste") {
          // sql = "SELECT * ";
          // sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
          // sql = sql + "WHERE  DataMarcada >= '2026-01-05' ";
          // sql = sql + "AND  DataMarcada < '2026-01-06' ";
          // sql = sql + "ORDER BY DataMarcada";

          sql = "SELECT * ";
          sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
          sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 0 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "AND  DataMarcada < DATEADD(dd," + 1 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "ORDER BY DataMarcada";
        } else {
          sql = "SELECT * ";
          sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
          sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 0 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "AND  DataMarcada < DATEADD(dd," + 1 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "ORDER BY DataMarcada";
        }
        const res = await pool.query(sql);
        const recordset = res.recordset;
        await oft45EnvioMensagensJson(recordset, tipoMsg);

        resp.end("Ok"+ resp.status.toString() +
          "\n\n mensagens enviadas");
        //
      } catch (err) {
        console.error("Erro oft45ReconfirmacaoPacientesJsonV2:", err);
        return null;
      }
    //
    });


// NOVA FUNÇÃO DE PESQUISA DE SATISFAÇÃO
// 07:00 - 09:59, de 4 em 4 minutos
exports.oft45PesquisaSatisfacaoJsonV2 = functions
    .runWith({timeoutSeconds: 540}).https
    .onRequest(async (req, resp) => {
      //
      // 09:00 - 11:59, de 4 em 4 minutos
      // exports.oft45PesquisaSatisfacaoJsonV2 = functions
      //     .runWith({timeoutSeconds: 540}).pubsub
      //     .schedule("*/4 09-11 * * 1-5")
      //     .timeZone("America/Sao_Paulo")
      //     .onRun(async (context) => {
      //
      console.log("Entrou Função oft45PesquisaSatisfacaoJsonV2");

      const today = new Date();
      const year = today.getFullYear();
      const mm = today.getMonth() + 1;
      const dd = today.getDate();

      const tipoMsg = "pesquisaSatisfacao";

      try {
        const pool = await sqlConnection.connect(sqlConfig);
        let sql = "";

        console.log("Entrou connect");

        if (ambiente == "teste") {
          sql = "SELECT * ";
          sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
          sql = sql + "WHERE  IDAtendimento IS NOT NULL ";
          sql = sql + "AND  DataMarcada >= '2025-11-17' ";
          sql = sql + "AND  DataMarcada < '2025-11-18' ";
          sql = sql + "ORDER BY DataMarcada";
        } else {
          sql = "SELECT * ";
          sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
          sql = sql + "WHERE  IDAtendimento IS NOT NULL ";
          sql = sql + "AND  DataMarcada < DATEADD(dd," + 0 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "AND  DataMarcada >= DATEADD(dd," + -1 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "ORDER BY DataMarcada";
        }
        const res = await pool.query(sql);
        const recordset = res.recordset;
        await oft45EnvioMensagensJson(recordset, tipoMsg);
        resp.end("Ok"+ resp.status.toString() +
          "\n\n mensagens enviadas");
        //
      } catch (err) {
        console.error("Erro oft45PesquisaSatisfacaoJsonV2:", err);
        return null;
      }
    //
    });

/**
 * @constructor
 * @param {Object[]} recordset
 * @param {String} tipoMsg
 * @return {Promise<null>}
 */
const oft45EnvioMensagensJson = async (recordset = [], tipoMsg) => {
  //
  console.log("Entrou Função oft45EnvioMensagensJson");

  try {
    // ========== ROMDOMIZAÇÃO ============
    // ---------------------- ativa ou não o programa
    // chance de rodar (0.5 = 50%)
    const chance = 0.7;

    // "sorteio": Math.random() retorna um número em [0, 1)
    if (Math.random() >= chance) {
      console.log(`Skip (random gate): não vai rodar desta vez.
        chance=${chance}`);
      return null;
    }
    // -----------------------------------------------

    // ------------------------ atraso para começar a enviar mensagens
    // de 10s a 57s
    const minMs = 10000;
    const maxMs = 57000;
    const wait = minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
    const sec = Math.floor(wait / 1000);
    console.log(`Aguarde para começar ${sec}s`);
    await new Promise((resolve) => setTimeout(resolve, wait));
    // --------------------------------------------------

    // ------------------------- quantas mensagens vão ser enviadas
    // tamanho do lote aleatório entre 4 a 9
    const minQtdEnvio = 4;
    const maxQtdEnvio = 9;
    const QtdEnvio = Math.floor(Math.random() *
        (maxQtdEnvio - minQtdEnvio + 1)) + minQtdEnvio;

    // if (ambiente == "teste") QtdEnvio = 1;
    console.log(`Quantidade a Enviar: ${QtdEnvio} registros`);
    // -----------------------------------------------------

    let contWhatsApp = 0;
    const today = new Date();

    const db = admin.database();
    const refBase = db.ref("OFT/45/" + tipoMsg + "/zapi/");
    console.log("refBase >>>" + refBase);

    const refAEnviar = refBase.child("aEnviar");
    const refEnviados = refBase.child("enviados");
    const pacSemConversasAnt = refBase.child("pacSemConversasAnt");
    const refMeta = refBase.child("ultimaLeituraSql");

    const hoje = today.toISOString().slice(0, 10);
    const lastLoad = (await refMeta.child("lastLoad")
        .once("value")).val();

    const filaSnap = await refAEnviar.limitToFirst(1).once("value");

    if (!filaSnap.exists() && lastLoad !== hoje) {
      await refEnviados.set(null);
      await pacSemConversasAnt.set(null);

      const dadosFiltrados =
      limparDuplicatasPorIDMarcacao(recordset);
      for (const element of dadosFiltrados) {
        //
        const dt = element.DataMarcada;
        element.DataMarcada =
          `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}  ` +
        `${dt.getHours()}:${dt.getMinutes().toString().padStart(2, "0")}`;

        // await refAEnviar.child(element.IDMarcacao.toString())
        //     .set(element);
        const id = element.IDMarcacao.toString();
        await refAEnviar.child(id).transaction((current) => {
          // se current já tem algo, devolve o próprio
          // current ⇒ nada é escrito
          // se ainda não tem (null), devolve element ⇒ grava
          // garante que duas instancias gravem com o mesmo IDMarcacao
          return current || element;
        });
        contWhatsApp++;
      }

      console.log(`Fila carregada com ${contWhatsApp} registros`);
      await refMeta.child("lastLoad").set(hoje);

      return null; // encerra – próxima execução cuidará do envio
    } else if (!filaSnap.exists()) {
      // MNENSAGENS JÁ FORAM ENVIADAS HOJE
      console.log("Fila vazia e carga diária já feita - nada a fazer.");

      return null;
    }
    //   fila aEnviar JÁ TEM DADOS:
    //   pega de 5 a 13 primeiros, move p/ 'enviados' e apaga da fila

    const loteSnap = await refAEnviar.orderByKey()
        .limitToFirst(QtdEnvio).once("value");

    if (!loteSnap.exists()) {
      console.log("Entrou no processo de enviar " +
        "mensagens porem não há registros");
      return null; // proteção extra
    }

    // Converte o snapshot em uma lista ordenada
    const itens = [];
    loteSnap.forEach((child) => {
      itens.push({id: child.key, dados: child.val()});
    });

    // Função auxiliar para aguardar
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    // Intervalo aleatório entre mensagens (ajuste como preferir)
    const minDelay = 30000; // 30s
    const maxDelay = 58000; // 58s
    const randInt = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    console.log(`Movendo ${itens.length} registros de /aEnviar -> /enviados`);

    for (let i = 0; i < itens.length; i++) {
      const {id, dados} = itens[i];

      // 1) Cria em /enviados/{id} -> dispara onCreate
      await refEnviados.child(id).set(dados);

      // 2) Remove de /aEnviar/{id}
      await refAEnviar.child(id).set(null);

      // 3) Delay aleatório ENTRE mensagens
      if (i < itens.length - 1) {
        const wait = randInt(minDelay, maxDelay);
        const sec = Math.floor(wait / 1000);

        console.log(`Delay entre mensagens: ${sec}s
          (após mover id=${id})`);
        await sleep(wait);
      }
    }

    console.log(`Movidos ${loteSnap.numChildren()}
      registros para /enviados`);

    return null;
  } catch (err) {
    console.log("Erro oft45EnvioMensagens:", err);
    return null;
  }
};


// NOVA FUNÇÃO CONFIRMAÇÃO  ZAPI
exports.oft45ConfirmacaoPacientesZApiV2 =
  functions.database
      .ref("OFT/45/confirmacaoPacientes/zapi/enviados/{pushId}")
      .onCreate(async (snapshot, context) => {
        //
        console.log("Entrou oft45ConfirmacaoPacientesZApiV2");
        const tipoMsg = "confirmacaoPacientes";
        const planilhaConsulta = "1NI_jOTSq0J8bjLLjs0d5937T3n5iP76z19ElRHwmpNU";
        const planilhaExame = "1bIfGCXT4TKSD85qR9ZBr70ZbDuFeaIZ-vKilWQNDois";

        try {
          await oft45EnvioMensagensZApi(snapshot, context, tipoMsg,
              planilhaConsulta, planilhaExame);
        } catch (err) {
          console.error("Erro em oft45ConfirmacaoPacientesZApiV2:", err);
        }
        return null;
      });


// NOVA FUNÇÃO PESQUISA SATISFACAO  ZAPI
exports.oft45PesquisaSatisfacaoZApiV2 =
  functions.database
      .ref("OFT/45/pesquisaSatisfacao/zapi/enviados/{pushId}")
      .onCreate(async (snapshot, context) => {
        //
        console.log("Entrou oft45PesquisaSatisfacaoZApiV2");

        const tipoMsg = "pesquisaSatisfacao";
        const planilhaConsulta = "1RPT5vKrcbNRRQZ7AeyfMNK620ksxeAqqIDJ-YivIPS0";
        // não envia pesq.satisfacao para Campo Visual
        const planilhaExame = "";

        try {
          await oft45EnvioMensagensZApi(snapshot, context, tipoMsg,
              planilhaConsulta, planilhaExame);
        } catch (err) {
          console.error("Erro em oft45PesquisaSatisfacaoZApiV2:", err);
        }
        return null;
      });

/**
 * @constructor
 * @param {Object} snapshot
 * @param {Object} context
 * @param {String} tipoMsg
 * @param {String} planilhaConsulta
 * @param {String} planilhaExame
 * @return {Promise<null>}
 */
async function oft45EnvioMensagensZApi(snapshot, context, tipoMsg,
    planilhaConsulta, planilhaExame) {
  //
  console.log("Entrou oft45EnviosMensagensZApi");
  // .onCreat = se um mesmo registro for sobrescrito,
  // a função não dispara de novo.

  const db = admin.database();
  const element = snapshot.val();

  console.log("element:", JSON.stringify(element));
  const endereco = "Praça Saenz Pena 45, sala 1508 - Tijuca";

  let paciente = "";
  let dataMarcada = "";
  let medico = "";
  let convenio = "";
  let whatsAppCel = "";
  let IDMarcacao = "";

  if (element.Paciente) {
    paciente = element.Paciente;
  }
  if (element.DataMarcada) {
    dataMarcada = element.DataMarcada;
  }
  if (element.Medico) {
    medico = element.Medico;
    console.log(medico);
  }
  if (element.Convenio) {
    convenio = element.Convenio;
  }
  if (element.IDMarcacao) {
    IDMarcacao = element.IDMarcacao;
  }

  // let telCadastrado = "";
  let Telefone = "";
  let TelefoneCel = "";
  let TelefoneCom = "";
  let TelefoneRes = "";

  if (element.Telefone) {
    Telefone = tel2Whats(element.Telefone);
    // auxTelefone = element.Telefone + " / ";
    console.log("Telefone: " + Telefone);
  }
  if (element.TelefoneCel) {
    TelefoneCel = tel2Whats(element.TelefoneCel);
    // auxTelefoneCel = element.TelefoneCel + " / ";
    console.log("TelefoneCel: " + TelefoneCel);
  }
  if (element.TelefoneRes) {
    TelefoneRes = tel2Whats(element.TelefoneRes);
    // auxTelefoneRes = element.TelefoneRes + " / ";
    console.log("TelefoneRes: " + TelefoneRes);
  }
  if (element.TelefoneCom) {
    TelefoneCom = tel2Whats(element.TelefoneCom);
    // auxTelefoneCom = element.TelefoneCom;
    console.log("TelefoneCom: " + TelefoneCom);
  }

  if (Telefone != "") {
    whatsAppCel = Telefone;
  } else if (TelefoneCel != "") {
    whatsAppCel = TelefoneCel;
  } else if (TelefoneRes!= "") {
    whatsAppCel = TelefoneRes;
  } else if (TelefoneCom != "") {
    whatsAppCel = TelefoneCom;
  }

  // se medico é campo visual não envia
  let consultaExame = true;
  if (tipoMsg === "pesquisaSatisfacao" &&
    medico === "Campo Visual") consultaExame = false;

  console.log("whatsAppCel: " + whatsAppCel);
  if (consultaExame) {
    let parametros = {};
    let message1 = "";

    if (whatsAppCel) {
      const convRef = db
          .ref("OFT/45/agendamentoWhatsApp/operacional/conversas");
      const convSnap = await convRef.child(whatsAppCel).once("value");

      if (!convSnap.exists()) {
      // NÃO está na lista de conversas:
      // mover de enviados -> pacSemConversasAnt
        const base = "OFT/45/" + tipoMsg + "/zapi";
        const updates = {};
        updates[`${base}/pacSemConversasAnt/${IDMarcacao}`] = element;
        updates[`${base}/enviados/${IDMarcacao}`] = null;
        await db.ref().update(updates);
        console.log(`Movido para pacSemConversasAnt: ${IDMarcacao}
          (telefone sem conversa prévia: ${whatsAppCel})`);
        return null;
      }

      if (convenio == "Particular Oft") convenio = "Particular";

      // ------------------------- rondom de mensagens
      const min = 1;
      const maxConsulta = 50;
      const maxExame = 15;

      const IDmesgConsulta = Math.floor(Math.random() *
          (maxConsulta - min + 1)) + min;
      const IDmesgExame = Math.floor(Math.random() *
          (maxExame - min + 1)) + min;

      console.log(`ID mensagem da Consulta: ${IDmesgConsulta}`);
      console.log(`ID mensagem do Exame: ${IDmesgExame}`);
      // -----------------------------------------------------

      const msgConsultaRef = db
          .ref("/OFT/45/" + tipoMsg + "/mensagens/" +
            "consulta/" + planilhaConsulta +"/" +
            "mensagemConsulta/");

      const msgExameRef = db
          .ref("/OFT/45/" + tipoMsg + "/mensagens/" +
            "exame/" + planilhaExame + "/" +
            "mensagemExame");

      let msg = null;

      if (medico == "Campo Visual") {
        const snap = await msgExameRef
            .child(String(IDmesgExame)).child("Texto").once("value");
        msg = snap.exists() ? snap.val() : "";

        //
      } else {
        const snap = await msgConsultaRef
            .child(String(IDmesgConsulta)).child("Texto").once("value");
        msg = snap.exists() ? snap.val() : "";
      }
      message1 = (msg || "")
          .replace(/\{paciente\}/gi, paciente)
          .replace(/\{datamarcada\}/gi, dataMarcada)
          .replace(/\{medico\}/gi, medico)
          .replace(/\{convenio\}/gi, convenio)
          .replace(/\{endereco\}/gi, endereco);

      if (ambiente == "teste") {
        whatsAppCel = "5521971938840"; // gabriel
        parametros = {
          id: "3B74CE9AFF0D20904A9E9E548CC778EF",
          token: "A8F754F1402CAE3625D5D578",
          // buttonList: buttonList,
        };
      } else {
        if (envio === "teste") {
          whatsAppCel = "5521971938840"; // gabriel
        }
        parametros = {
          // OFT
          id: "39C7A89881E470CC246252059E828D91",
          token: "B1CA83DE10E84496AECE8028",
          // buttonList: buttonList,
        };
      }
    } else {
      db.ref(`OFT/45/${tipoMsg}/zapi/erro/${IDMarcacao}`)
          .set(element);

      return null;
    }
    if (ambiente == "teste") {
      message1 = message1 + "\n\n" + whatsAppCel;
    }

    const arrMessage = [{
      "phone": whatsAppCel,
      "message": message1,
    }];

    // lê o campo Copiado
    const idMarcacaoPath = String(IDMarcacao || context.params.pushId);
    const siteRef = db.ref("OFT/45/" + tipoMsg + "/site/aEnviar")
        .child(idMarcacaoPath);
    const copiadoTrueSnap = await siteRef
        .child("Copiado").once("value");

    if (copiadoTrueSnap.val() === true) {
      // mover de enviados -> enviadoManualmente
      const baseManual = "OFT/45/" + tipoMsg + "/zapi";
      const updatesManual = {};
      updatesManual[
          `${baseManual}/enviadosManualmente/${IDMarcacao}`] = element;
      updatesManual[`${baseManual}/enviados/${IDMarcacao}`] = null;
      await db.ref().update(updatesManual);

      console.log(`Skip envio, já possui Copiado=true. Salvo em
            enviadosManualmente. IDMarcacao: ${idMarcacaoPath}`);
      return null;
      //
    } else {
      console.log("Mensagem REALMENTE enviada:",
          JSON.stringify(arrMessage));

      // callZapiV3
      const i = 0;
      callZapiV3(arrMessage, parametros, i);

      // copiado: true
      await db.ref("OFT/45/" + tipoMsg + "/site/aEnviar")
          .child(String(IDMarcacao))
          .update({Copiado: true});
      console.log(`Marcado copiado=true para IDMarcacao ${IDMarcacao}`);

      return null;
      //
    }
  } else {
    const refEnviados = db
        .ref("OFT/45/" + tipoMsg + "/zapi/enviados/" +
        IDMarcacao);
    refEnviados.set(null);
  }
}

// FUNÇÃO ORIGINAL
// exports.oft45ConfirmacaoPacientesJson = functions.https
//     .onRequest(async (req, resp) => {
// exports.oft45ConfirmacaoPacientesJson = functions.pubsub
//     .schedule("00 07 * * 1-5")
//     .timeZone("America/Sao_Paulo")
//     .onRun(async (context) => {
//       //
//       console.log("Entrou Função oft45ConfirmacaoPacientesJson");

//       let contWhatsApp = 0;
//       const today = new Date();
//       const year = today.getFullYear();
//       const mm = today.getMonth()+1;
//       const dd = today.getDate();
//       const diaDaSemana = today.getDay();

//       // if (diaDaSemana != 0 && diaDaSemana != 6 ) {
//       try {
//         // make sure that any items are correctly
//         // URL encoded in the connection string
//         // console.log("Entrou try");

//         return sqlConnection.connect(sqlConfig).then((pool) => {
//           // pool.sqlConnection.connect(sqlConfig);
//           console.log("Entrou connect");
//           let sql = "";

//           if (ambiente == "teste") {
//             sql = "SELECT * ";
//             sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
//             sql = sql + "WHERE  DataMarcada >= '2025-12-25' ";
//             sql = sql + "AND  DataMarcada < '2025-12-26' ";
//             sql = sql + "ORDER BY DataMarcada";
//           } else {
//             // SELECIONAR O DIA DESEJADO
//             // sql = "SELECT * ";
//             // sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
//             // sql = sql + "WHERE  DataMarcada >= '2025-09-10' ";
//             // sql = sql + "AND  DataMarcada < '2025-09-13' ";
//             // sql = sql + "ORDER BY DataMarcada";

//             // SELECT ORIGINAL
//             if (diaDaSemana == 4) {
//               sql = "SELECT * ";
//               sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
//               sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 1 + ",";
//               sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//               sql = sql + ",0,0,0,0)) ";
//               sql = sql + "AND  DataMarcada < DATEADD(dd," + 5 + ",";
//               sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//               sql = sql + ",0,0,0,0)) ";
//               sql = sql + "ORDER BY DataMarcada";
//             } else if (diaDaSemana == 5) {
//               sql = "SELECT * ";
//               sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
//               sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 3 + ",";
//               sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//               sql = sql + ",0,0,0,0)) ";
//               sql = sql + "AND  DataMarcada < DATEADD(dd," + 5 + ",";
//               sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//               sql = sql + ",0,0,0,0)) ";
//               sql = sql + "ORDER BY DataMarcada";
//             } else {
//               sql = "SELECT * ";
//               sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
//               sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 1 + ",";
//               sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//               sql = sql + ",0,0,0,0)) ";
//               sql = sql + "AND  DataMarcada < DATEADD(dd," + 3 + ",";
//               sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//               sql = sql + ",0,0,0,0)) ";
//               sql = sql + "ORDER BY DataMarcada";
//             }
//           }

//           return pool.query(sql);
//           // const result = pool.query(sql);
//         }).then((result) => {
//           const db = admin.database();
//           // console.log("result: " + JSON.stringify(result, null, 2));


//           // -------------------------- salvar log grande em um arquivo .TXT
//           // const fs = require("fs");
//           // const path = require("path");

//           // const saveDirectory =
//           //   "C:/Users/Master/OneDrive/Área de Trabalho/logs";

//           // if (!fs.existsSync(saveDirectory)) {
//           //   fs.mkdirSync(saveDirectory, {recursive: true});
//           // }

//           // // Converte o JSON para string formatada
//           // const jsonString = JSON.stringify(result, null, 2);

//           // // Define o nome do arquivo
//           // const fileName = path.join(saveDirectory, "logJson.txt");

//           // fs.writeFile(fileName, jsonString,
//           //     {encoding: "utf-8"}, (err) => {
//           //       if (err) {
//           //         console.error("Erro ao salvar o arquivo:", err);
//           //       } else {
//           //         console.log(`Log salvo em: ${fileName}`);
//           //       }
//           //     });
//           // --------------------------------------------------------------

//           const refAEnviar = db.ref("OFT/45/confirmacaoPacientes/aEnviar");

//           refAEnviar.set(null);

//           const dadosFiltrados =
//           limparDuplicatasPorIDMarcacao(result.recordset);

//           dadosFiltrados.forEach((element) => {
//             console.log("element:", JSON.stringify(element));
//             if (ambiente === "teste" && contWhatsApp >= 3) {
//               console.log("Ambiente Teste - 3 mesnsagens enviadas");
//               return null;
//             }

//             const year = element.DataMarcada.getFullYear();
//             const mm = element.DataMarcada.getMonth()+1;
//             const dd = element.DataMarcada.getDate();
//             const hh = element.DataMarcada.getHours();
//             let min = element.DataMarcada.getMinutes();
//             if (min == 0 ) {
//               min = "00";
//             }
//             const dataMarcada = dd + "/" + mm + "/" +
//               year + "  " + hh + ":" + min;
//             element.DataMarcada = dataMarcada;
//             //
//             contWhatsApp = contWhatsApp + 1;
//           });
//           // resp.end("Ok"+ resp.status.toString() +
//           // "\n\nmensagens lidas: " + contWhatsApp +
//           // "\n\nmensagens aEnviar: " + contWhatsAppAEnviar +
//           // "\n\nmensagens erro: " + contWhatsAppErro);

//           console.log("mensagens lidas: " + contWhatsApp);

//           // refAEnviar.set(true);
//           return null;
//         });
//       } catch (err) {
//         // ... error checks
//         console.log("Erro try: " + JSON.stringify(err));
//       }
//       // }
//     });

// =====================================================================
// =============================== SITE ================================
// =====================================================================

// FUNÇÃO CONFIRMAÇÃO PARA O SITE
// exports.oft45ConfirmacaoPacientesSiteJson = functions
//     .runWith({timeoutSeconds: 540}).https
//     .onRequest(async (req, resp) => {
exports.oft45ConfirmacaoPacientesSiteJson = functions
    .runWith({timeoutSeconds: 540}).pubsub
    .schedule("00 05,15 * * 1-5")
    .timeZone("America/Sao_Paulo")
    .onRun(async (context) => {
    //
      console.log("Entrou Função oft45ConfirmacaoPacientesSiteJson");

      const today = new Date();
      const diaDaSemana = today.getDay();
      const year = today.getFullYear();
      const mm = today.getMonth() + 1;
      const dd = today.getDate();

      const tipoMsg = "confirmacaoPacientes";

      try {
        const pool = await sqlConnection.connect(sqlConfig);
        let sql = "";

        console.log("Entrou connect");

        if (ambiente == "teste") {
          sql = "SELECT * ";
          sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
          sql = sql + "WHERE  DataMarcada >= '2026-01-05' ";
          sql = sql + "AND  DataMarcada < '2026-01-06' ";
          sql = sql + "ORDER BY DataMarcada";
        } else {
          if (diaDaSemana == 4) {
            sql = "SELECT * ";
            sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
            sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 0 + ",";
            sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)) ";
            sql = sql + "AND  DataMarcada < DATEADD(dd," + 7 + ",";
            sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)) ";
            sql = sql + "ORDER BY DataMarcada";
          } else if (diaDaSemana == 5) {
            sql = "SELECT * ";
            sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
            sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 0 + ",";
            sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)) ";
            sql = sql + "AND  DataMarcada < DATEADD(dd," + 7 + ",";
            sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)) ";
            sql = sql + "ORDER BY DataMarcada";
          } else {
            sql = "SELECT * ";
            sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
            sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 0 + ",";
            sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)) ";
            sql = sql + "AND  DataMarcada < DATEADD(dd," + 7 + ",";
            sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)) ";
            sql = sql + "ORDER BY DataMarcada";
          }
        }

        const res = await pool.query(sql);
        const recordset = res.recordset;
        await oft45DadosSiteEnvios(recordset, tipoMsg);
        // resp.end("Ok"+ resp.status.toString() +
        //   "\n\n mensagens enviadas");
        //
      } catch (err) {
        console.error("Erro oft45ConfirmacaoPacientesSiteJson:", err);
        return null;
      }
    //
    });

// FUNÇÃO RECONFIRMAÇÃO PARA O SITE
// exports.oft45ReconfirmacaoPacientesSiteJson = functions
//     .runWith({timeoutSeconds: 540}).https
//     .onRequest(async (req, resp) => {
exports.oft45ReconfirmacaoPacientesSiteJson = functions
    .runWith({timeoutSeconds: 540}).pubsub
    .schedule("05 05,15 * * 1-5")
    .timeZone("America/Sao_Paulo")
    .onRun(async (context) => {
      //
      console.log("Entrou Função oft45ReconfirmacaoPacientesSiteJson");

      const today = new Date();
      const year = today.getFullYear();
      const mm = today.getMonth() + 1;
      const dd = today.getDate();

      const tipoMsg = "reconfirmacaoPacientes";

      try {
        const pool = await sqlConnection.connect(sqlConfig);
        let sql = "";

        console.log("Entrou connect");

        if (ambiente == "teste") {
          sql = "SELECT * ";
          sql = sql + "FROM dbo.vw_GSht_Age_Marcacao_Confirmacao ";
          sql = sql + "WHERE DataMarcada >= '2026-01-05' ";
          sql = sql + "AND DataMarcada < '2026-01-06' ";
          sql = sql + "ORDER BY DataMarcada";
        } else {
          sql = "SELECT * ";
          sql = sql + "FROM dbo.vw_GSht_Age_Marcacao_Confirmacao ";
          sql = sql + "WHERE DataMarcada >= DATEADD(dd," + 0 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "AND DataMarcada < DATEADD(dd," + 3 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "ORDER BY DataMarcada";
        }

        const res = await pool.query(sql);
        const recordset = res.recordset;
        await oft45DadosSiteEnvios(recordset, tipoMsg);
        // resp.end("Ok"+ resp.status.toString() +
        //   "\n\n mensagens enviadas");
        //
      } catch (err) {
        console.error("Erro oft45ReconfirmacaoPacientesSiteJson:", err);
        return null;
      }
    //
    });


// FUNÇÃO PACIENTES FALTOSOS PARA O SITE
// exports.oft45PacientesFaltososSiteJson = functions
//     .runWith({timeoutSeconds: 540}).https
//     .onRequest(async (req, resp) => {
exports.oft45PacientesFaltososSiteJson = functions
    .runWith({timeoutSeconds: 540}).pubsub
    .schedule("10 05,15 * * 1-5")
    .timeZone("America/Sao_Paulo")
    .onRun(async (context) => {
      //
      console.log("Entrou Função oft45PacientesFaltososSiteJson");

      const today = new Date();
      const year = today.getFullYear();
      const mm = today.getMonth() + 1;
      const dd = today.getDate();

      const tipoMsg = "pacientesFaltosos";

      try {
        const pool = await sqlConnection.connect(sqlConfig);
        let sql = "";

        console.log("Entrou connect");

        if (ambiente == "teste") {
          sql = "SELECT * ";
          sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
          sql = sql + "WHERE  IDAtendimento IS NULL ";
          sql = sql + "AND  DataMarcada >= '2026-01-05' ";
          sql = sql + "AND  DataMarcada < '2026-01-06' ";
          sql = sql + "ORDER BY DataMarcada";
        } else {
          sql = "SELECT * ";
          sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
          sql = sql + "WHERE  IDAtendimento IS NULL ";
          sql = sql + "AND  DataMarcada < DATEADD(dd," + 0 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "AND  DataMarcada >= DATEADD(dd," + -5 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "ORDER BY DataMarcada";
        }

        const res = await pool.query(sql);
        const recordset = res.recordset;
        await oft45DadosSiteEnvios(recordset, tipoMsg);
        // resp.end("Ok"+ resp.status.toString() +
        //   "\n\n mensagens enviadas");
        //
      } catch (err) {
        console.error("Erro oft45PacientesFaltososSiteJson:", err);
        return null;
      }
    //
    });

// FUNÇÃO PESQUISA DE SATISFAÇÃO PARA O SITE
// exports.oft45PesquisaSatisfacaoSiteJson = functions
//     .runWith({timeoutSeconds: 540}).https
//     .onRequest(async (req, resp) => {
exports.oft45PesquisaSatisfacaoSiteJson = functions
    .runWith({timeoutSeconds: 540}).pubsub
    .schedule("15 05,15 * * 1-5")
    .timeZone("America/Sao_Paulo")
    .onRun(async (context) => {
      //
      console.log("Entrou Função oft45PesquisaSatisfacaoSiteJson");

      const today = new Date();
      const year = today.getFullYear();
      const mm = today.getMonth() + 1;
      const dd = today.getDate();

      const tipoMsg = "pesquisaSatisfacao";

      try {
        const pool = await sqlConnection.connect(sqlConfig);
        let sql = "";

        console.log("Entrou connect");

        if (ambiente == "teste") {
          sql = "SELECT * ";
          sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
          sql = sql + "WHERE  IDAtendimento IS NOT NULL ";
          sql = sql + "AND  DataMarcada >= '2025-11-17' ";
          sql = sql + "AND  DataMarcada < '2025-11-18' ";
          sql = sql + "ORDER BY DataMarcada";
        } else {
          sql = "SELECT * ";
          sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
          sql = sql + "WHERE  IDAtendimento IS NOT NULL ";
          sql = sql + "AND  DataMarcada < DATEADD(dd," + 0 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "AND  DataMarcada >= DATEADD(dd," + -3 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "ORDER BY DataMarcada";
        }

        const res = await pool.query(sql);
        const recordset = res.recordset;
        await oft45DadosSiteEnvios(recordset, tipoMsg);
        // resp.end("Ok"+ resp.status.toString() +
        //   "\n\n mensagens enviadas");
        //
      } catch (err) {
        console.error("Erro oft45PesquisaSatisfacaoSiteJson:", err);
        return null;
      }
    //
    });


/**
 * @constructor
 * @param {Object[]} recordset
 * @param {String} tipoMsg
 * @return {Promise<null>}
 */
async function oft45DadosSiteEnvios(recordset, tipoMsg) {
  console.log("Entrou oft45DadosSiteEnvios:", tipoMsg);

  try {
    const db = admin.database();

    const refAEnviar = db.ref("OFT/45/" + tipoMsg + "/site/aEnviar");
    const refAErro = db.ref("OFT/45/" + tipoMsg + "/site/erro");

    let contWhatsApp = 0;
    let contWhatsAppAEnviar = 0;
    let contWhatsAppErro = 0;

    // Ler o que já existe em aEnviar para preservar Copiado:true por ID
    const snapExistentes = await refAEnviar.once("value");
    const existentesPorId = new Map();
    if (snapExistentes.exists()) {
      snapExistentes.forEach((child) => {
        const val = child.val();
        const idKey = child.key; // gravamos por child(ID)
        if (idKey) {
          existentesPorId.set(String(idKey), val);
        } else if (val && (val.IDMarcacao || val.IdMarcacao ||
          val.idMarcacao || val.id_marcacao)) {
          const k = String(val.IDMarcacao || val.IdMarcacao ||
            val.idMarcacao || val.id_marcacao);
          existentesPorId.set(k, val);
        }
      });
    }

    // preservar Copiado:true por ID
    const snapErroExistentes = await refAErro.once("value");
    const erroPorId = new Map();
    if (snapErroExistentes.exists()) {
      snapErroExistentes.forEach((child) => {
        const val = child.val();
        const idKey = child.key;
        if (idKey) {
          erroPorId.set(String(idKey), val);
        } else if (val && (val.IDMarcacao || val.IdMarcacao ||
          val.idMarcacao || val.id_marcacao)) {
          const k = String(val.IDMarcacao || val.IdMarcacao ||
            val.idMarcacao || val.id_marcacao);
          erroPorId.set(k, val);
        }
      });
    }

    // Guardar os IDs vindos do SQL (para limpeza opcional de aEnviar)
    const idsDoSQL = new Set();

    const dadosFiltrados =
      limparDuplicatasPorIDMarcacao(recordset);

    dadosFiltrados.forEach((element) => {
      console.log("element:", JSON.stringify(element));

      // [ALTERAÇÃO 6] Normalizar ID estável da marcação
      const ID = String(
          element.IDMarcacao || element.IdMarcacao ||
          element.idMarcacao || element.id_marcacao ||
          element.Id || element.ID || "");
      if (!ID) {
        console.warn("Registro sem IDMarcacao válido," +
          "enviando para erro:", element);

        // salvar em erro por chave estável e preservar Copiado:true
        // se já existir mesmo sem ID (não é possível sem ID)
        refAErro.push(element);
        contWhatsAppErro = contWhatsAppErro + 1;
        contWhatsApp = contWhatsApp + 1;
        return null;
      }
      idsDoSQL.add(ID);

      const year = element.DataMarcada.getFullYear();
      const mmm = element.DataMarcada.getMonth()+1;
      const ddd = element.DataMarcada.getDate();
      const hh = element.DataMarcada.getHours();
      let min = element.DataMarcada.getMinutes();

      min = (min == 0) ? "00" : String(min).padStart(2, "0");

      const dataMarcada = ddd + "/" + mmm + "/" + year +
      "  " + hh + ":" + min;
      element.DataMarcada = dataMarcada;

      // Telefone / WhatsApp
      let whatsAppCel = "";
      let Telefone = "";
      let TelefoneCel = "";
      let TelefoneCom = "";
      let TelefoneRes = "";
      let medico = "";

      if ((element.Convenio) &&
        (element.Convenio === "Particular Oft")) {
        element.Convenio = "Particular";
      }

      if (element.Telefone) {
        Telefone = tel2Whats(element.Telefone);
        console.log("Telefone: " + Telefone);
      }
      if (element.TelefoneCel) {
        TelefoneCel = tel2Whats(element.TelefoneCel);
        console.log("TelefoneCel: " + TelefoneCel);
      }
      if (element.TelefoneRes) {
        TelefoneRes = tel2Whats(element.TelefoneRes);
        console.log("TelefoneRes: " + TelefoneRes);
      }
      if (element.TelefoneCom) {
        TelefoneCom = tel2Whats(element.TelefoneCom);
        console.log("TelefoneCom: " + TelefoneCom);
      }

      if (Telefone != "") {
        whatsAppCel = Telefone;
      } else if (TelefoneCel != "") {
        whatsAppCel = TelefoneCel;
      } else if (TelefoneRes!= "") {
        whatsAppCel = TelefoneRes;
      } else if (TelefoneCom != "") {
        whatsAppCel = TelefoneCom;
      }

      if (element.Medico) {
        medico = element.Medico;
        console.log("medico: " + medico);
      }

      console.log("whatsAppCel: " + whatsAppCel);

      if (whatsAppCel) {
        element.WhatsAppCel = whatsAppCel;

        // Preservar Copiado:true em aEnviar se já existir para este ID
        const existente = existentesPorId.get(ID);
        if (existente && existente.Copiado === true) {
          element.Copiado = true;
        } else if (element.Copiado !== true) {
          delete element.Copiado;
        }

        // [ALTERAÇÃO 8] Gravar em aEnviar por chave estável (ID)
        refAEnviar.child(ID).set(element);

        contWhatsAppAEnviar = contWhatsAppAEnviar + 1;
      } else {
        // Gravar em erro por chave estável (ID) e herdar
        // Copiado:true se existir
        const existenteErro = erroPorId.get(ID);
        if (existenteErro && existenteErro.Copiado === true) {
          element.Copiado = true;
        } else if (element.Copiado !== true) {
          delete element.Copiado;
        }

        refAErro.child(ID).set(element);

        contWhatsAppErro = contWhatsAppErro + 1;
      }
      contWhatsApp = contWhatsApp + 1;
    });

    // Remover de aEnviar itens que não vieram no SQL atual
    // [LIMPEZA aEnviar]
    if (snapExistentes.exists()) {
      const updates = {};
      snapExistentes.forEach((child) => {
        const id = child.key;
        if (id && !idsDoSQL.has(id)) {
          updates[id] = null; // apaga entradas antigas de aEnviar
        }
      });
      const temRemocoes = Object.values(updates).some((v) => v === null);
      if (temRemocoes) {
        await refAEnviar.update(updates);
      }
    }

    // [LIMPEZA erro] aplica a mesma regra de remoção usando idsDoSQL
    if (snapErroExistentes.exists()) {
      const updatesErro = {};
      snapErroExistentes.forEach((child) => {
        const id = child.key;
        if (id && !idsDoSQL.has(id)) {
          updatesErro[id] = null; // apaga entradas antigas de erro
        }
      });
      const temRemocoesErro = Object.values(updatesErro)
          .some((v) => v === null);
      if (temRemocoesErro) {
        await refAErro.update(updatesErro);
      }
    }

    console.log("mensagens lidas: " + contWhatsApp);
    console.log("mensagens aEnviar: " + contWhatsAppAEnviar);
    console.log("mensagens erro: " + contWhatsAppErro);
    return null;
    //
  } catch (err) {
    // ... error checks
    console.log("Erro try: " + JSON.stringify(err));
  }
}


// exports.oft45ConfirmacaoPacientesWaApi =
//     functions.database.ref("OFT/45/confirmacaoPacientes/aEnviar/{pushId}")
//         .onCreate((snapshot, context) => {
//           // .onCreat = se um mesmo registro for sobrescrito,
//           // a função não dispara de novo.

//           console.log("Entrou oft45ConfirmacaoPacientesWaApi");
//           const db = admin.database();
//           const element = snapshot.val();
//           let idTelClinica = "";

//           // true para usar modelos autorizados pela meta
//           // fase para NÃO usar modelos autorizados pela meta
//           const modelo = "true"; // true ou false

//           const accessToken = "EAASy47UeDpQBPFBlxVeD2ZCnhV2Tvxeij399Niuc3" +
//             "JSQSfO9cIySFi94gZCaEEGHZBYqzOZBAqjdZCM5ZBN" +
//             "XxBPps4e1jZCgMlcZAiQjM1SuGUCObTa4JsbfNjAuJ" +
//             "JXnCSOcZBZAxe6JoojTbqTWBZBtirGBTD95eaZCbeIU" +
//             "39lHMqUqaF61siFiOpTkZAT6UlgcSoDvQWwZDZD";

//           let nameSpace = "";
//           let nomeModeloConfirmar = "";
//           let nomeModeloConfirmarExame = "";

//           if (ambiente === "teste") {
//             // nameSpace = "89afd918_f7f2_4f2d_b35e_ee84bcbb26b3";
//             // nomeModeloConfirmar = "oft45_confirmacao_consulta";
//             // nomeModeloConfirmarExame = "oft45_confirmacao_consulta_exame";
//             //
//             nameSpace = "35cd7039_9f0f_4dc3_b66b_c3929e2c3ef4";
//             nomeModeloConfirmar =
//               "oft45_confirmacao_pacientes_consulta";
//             nomeModeloConfirmarExame =
//               "oft45_confirmacao_pacientes_exame";
//           } else {
//             nameSpace = "35cd7039_9f0f_4dc3_b66b_c3929e2c3ef4";
//             nomeModeloConfirmar =
//               "oft45_confirmacao_pacientes_consulta";
//             nomeModeloConfirmarExame =
//               "oft45_confirmacao_pacientes_exame";
//           }

//           console.log("element:", JSON.stringify(element));
//           const endereco = "Praça Saenz Pena 45, sala 1508 - Tijuca";

//           let paciente = "";
//           let dataMarcada = "";
//           let medico = "";
//           let convenio = "";
//           let whatsAppCel = "";
//           let IDMarcacao = "";

//           if (element.Paciente) {
//             paciente = element.Paciente;
//           }
//           if (element.DataMarcada) {
//             dataMarcada = element.DataMarcada;
//           }
//           if (element.Medico) {
//             medico = element.Medico;
//             console.log(medico);
//           }
//           if (element.Convenio) {
//             convenio = element.Convenio;
//           }
//           if (element.IDMarcacao) {
//             IDMarcacao = element.IDMarcacao;
//           }

//           let telCadastrado = "";
//           let Telefone = "";
//           let TelefoneCel = "";
//           let TelefoneCom = "";
//           let TelefoneRes = "";

//           let auxTelefone = "";
//           let auxTelefoneCel = "";
//           let auxTelefoneCom = "";
//           let auxTelefoneRes = "";

//           if (element.Telefone) {
//             Telefone = tel2Whats(element.Telefone);
//             auxTelefone = element.Telefone + " / ";
//             console.log("Telefone: " + Telefone);
//           }
//           if (element.TelefoneCel) {
//             TelefoneCel = tel2Whats(element.TelefoneCel);
//             auxTelefoneCel = element.TelefoneCel + " / ";
//             console.log("TelefoneCel: " + TelefoneCel);
//           }
//           if (element.TelefoneRes) {
//             TelefoneRes = tel2Whats(element.TelefoneRes);
//             auxTelefoneRes = element.TelefoneRes + " / ";
//             console.log("TelefoneRes: " + TelefoneRes);
//           }
//           if (element.TelefoneCom) {
//             TelefoneCom = tel2Whats(element.TelefoneCom);
//             auxTelefoneCom = element.TelefoneCom;
//             console.log("TelefoneCom: " + TelefoneCom);
//           }

//           if (Telefone != "") {
//             whatsAppCel = Telefone;
//           } else if (TelefoneCel != "") {
//             whatsAppCel = TelefoneCel;
//           } else if (TelefoneRes!= "") {
//             whatsAppCel = TelefoneRes;
//           } else if (TelefoneCom != "") {
//             whatsAppCel = TelefoneCom;
//           } else {
//             telCadastrado = auxTelefone + auxTelefoneCel +
//             auxTelefoneRes + auxTelefoneCom;
//           }

//           console.log("whatsAppCel: " + whatsAppCel);
//           if (medico != medicoAusente &&
//               medico != medicoAusente2 &&
//               medico != medicoAusente3) {
//             let parametros = {};
//             let message1 = "";
//             let telPaciente = "";
//             let arrMessage = [];

//             if (whatsAppCel) {
//               if (convenio == "Particular Oft") convenio = "Particular";

//               if (medico == "Campo Visual") {
//                 message1 = "Olá! Aqui é da Oftalmo Day." +
//                 "\n\nGostaríamos de confirmar o exame abaixo:" +
//                 "\n*Paciente:* " + paciente +
//                 "\n*Data/Hora:* " + dataMarcada +
//                 "\n*Exame:* " + medico +
//                 "\n*Plano:* " + convenio +
//                 "\n*Endereço:* " + endereco +
//                 "\n\n*CONFIRMA*?";
//               } else if (medico == "Glaucoma") {
//                 message1 = "Olá! Aqui é da Oftalmo Day." +
//                 "\n\nSua participação no *Evento de " +
//                 "Prevenção do Glaucoma* está confirmada." +
//                 "\n*Paciente:* " + paciente +
//                 "\n*Data/Hora:* 02/03/2024 (sábado)" +
//                 "\n*Endereço:* " + endereco +
//                 "\n\n*No evento vamos recolher 1 kg " +
//                 "de alimentos não perecíveis.*" +
//                 "\n*Caso queira contribuir com a ação, " +
//                 "sua doação será bem-vinda*" +
//                 "\n\nAguardamos sua presença!!!";
//               } else {
//                 message1 = "Olá! Aqui é da Oftalmo Day." +
//               "\n\nGostaríamos de confirmar o agendamento abaixo:" +
//               "\n*Paciente:* " + paciente +
//               "\n*Data/Hora:* " + dataMarcada +
//               "\n*Médico:* " + medico +
//               "\n*Plano:* " + convenio +
//               "\n*Endereço:* " + endereco +
//               "\n\n*CONFIRMA*?";
//               }

//               if (ambiente == "teste") {
//                 // idTelClinica = "691264807409202"; // Tel teste WA
//                 idTelClinica = "779376061914800"; // Tel teste oft
//                 telPaciente = "5521971938840"; // gabriel

//                 message1 = message1 + "\n\n" + whatsAppCel;
//                 console.log("message1: " + message1);
//               } else {
//                 idTelClinica = "ID DA CLINICA"; // OFT
//                 telPaciente = whatsAppCel; // telefone do paciente
//               }

//               if (modelo === "false") {
//                 // botão para enviar textos SEM modelos
//                 const interactive = {
//                   type: "button",
//                   body: {text: message1},
//                   action: {
//                     buttons: [
//                       {
//                         type: "reply",
//                         reply: {id: `CNFSIM-${IDMarcacao}-${paciente}`,
//                           title: "✅ Confirmar Consulta"},
//                       },
//                       {
//                         type: "reply",
//                         reply: {id: `CNFNAO-${IDMarcacao}-${paciente}`,
//                           title: "❌ Cancelar Consulta"},
//                       },
//                     ],
//                   },
//                 };

//                 // enviar mensagem com botões SEM modelos
//                 arrMessage = [{
//                   phone: telPaciente,
//                   interactive: interactive,
//                 }];
//               } else if (modelo === "true") {
//                 // enviar mensagem com botões COM modelos
//                 const componentsWithButton = [
//                   {
//                     type: "body",
//                     parameters: [
//                       {type: "text", parameter_name: "paciente",
//                         text: paciente},
//                       {type: "text", parameter_name: "data_marcada",
//                         text: dataMarcada},
//                       {type: "text", parameter_name: "medico",
//                         text: medico},
//                       {type: "text", parameter_name: "convenio",
//                         text: convenio},
//                       {type: "text", parameter_name: "endereco",
//                         text: endereco},
//                     ],
//                   },
//                   {
//                     type: "button",
//                     sub_type: "quick_reply",
//                     index: 0,
//                     parameters: [
//                       {
//                         type: "payload",
//                         parameter_name: "resposta_sim",
//                         payload: `CNFSIM-${IDMarcacao}-${paciente}`,
//                       },
//                     ],
//                   },
//                   {
//                     type: "button",
//                     sub_type: "quick_reply",
//                     index: 1,
//                     parameters: [
//                       {
//                         type: "payload",
//                         parameter_name: "resposta_nao",
//                         payload: `CNFNAO-${IDMarcacao}-${paciente}`,
//                       },
//                     ],
//                   },
//                 ];

//                 if (medico == "Campo Visual") {
//                 // enviar mensagem com botões COM modelos
//                   arrMessage = [{
//                     phone: telPaciente,
//                     template: {
//                       namespace: nameSpace,
//                       name: nomeModeloConfirmarExame,
//                       language: {
//                         policy: "deterministic", code: "pt_BR"},
//                       components: componentsWithButton},
//                   }];
//                 } else {
//                   arrMessage = [{
//                     phone: telPaciente,
//                     template: {
//                       namespace: nameSpace,
//                       name: nomeModeloConfirmar,
//                       language: {
//                         policy: "deterministic", code: "pt_BR"},
//                       components: componentsWithButton},
//                   }];
//                 }
//               }
//             } else {
//               // envio de mensagem de relatorio de erro
//               message1 = "PACIENTE *ERRO CONFIRMAÇÃO*:" +
//               "\nNOME: " + paciente +
//               "\nMÉDICO: " + medico +
//               "\nDATA/HORA: " + dataMarcada +
//               "\n\nTELEFONES CADASTRADOS: " + telCadastrado;

//               db.ref("OFT/45/confirmacaoPacientes/erro/")
//                   .push(JSON.stringify(message1));

//               // NÂO ENVIAR MENSAGEM DE ERRO PARA O CALL-CENTER
//               // if (ambiente == "teste") {
//               //   idTelClinica = "691264807409202"; // Tel teste WA
//               //   telPaciente = "5521971938840"; // gabriel

//               //   message1 = message1 + "\n\n" + whatsAppCel;
//               //   console.log("message1: " + message1);
//               // } else {
//               //   idTelClinica = "ID DA CLINICA"; // OFT
//               //   telPaciente = "5521994931662"; // OFT
//               // }

//               // if (modelo === "false") {
//               // // enviar mensagem SEM MODELO apenas texto (sem botão)
//               //   arrMessage = [{
//               //     phone: telPaciente,
//               //     text: message1,
//               //   }];
//               // } else if (modelo === "true") {
//               //   // enviar mensagem COM MODELO apenas texto (sem botão)
//               //   const componentsError = [{
//               //     type: "body",
//               //     parameters: [
//               //       {type: "text", parameter_name: "texto_erro",
//               //         text: message1},
//               //     ],
//               //   }];

//               //   arrMessage = [{
//               //     phone: telPaciente,
//               //     template: {
//               //       namespace: "89afd918_f7f2_4f2d_b35e_ee84bcbb26b3",
//               //       name: "erro_confirmacao",
//               //       language: {policy: "deterministic", code: "pt_BR"},
//               //       components: componentsError,
//               //     },
//               //   }];
//               // }
//             }

//             // callWaApi - envio de mensagem
//             parametros = {
//               phoneNumberId: idTelClinica,
//               accessToken: accessToken,
//             };
//             callWaApi(arrMessage, parametros, 0);
//             return null;
//             //
//           } else {
//             const pushID = context.params.pushId;
//         const refEnviados = db.ref("OFT/45/confirmacaoPacientes/enviados/" +
//                 pushID);
//             refEnviados.set(null);
//           }
//         });


// PACIENTES FALTOSOS VERSÃO ORIGINAL
// // exports.oft45PacientesFaltososJson = functions
// //     .runWith({timeoutSeconds: 540}).https.
// //     onRequest((req, resp) => {
// exports.oft45PacientesFaltososJson = functions.pubsub
//     .schedule("20 07 * * *")
//     .timeZone("America/Sao_Paulo") // Users can choose timezone
//     .onRun((context) => {
//       console.log("Entrou Função pacientesFaltosos45Json");

//       const today = new Date();
//       const year = today.getFullYear();
//       const mm = today.getMonth()+1;
//       const dd = today.getDate();
//       // let ultDataMarcada = null;
//       // let ultIDMarcacao = null;
//       let contWhatsApp = 0;
//       // const diaDaSemana = today.getDay();
//       try {
//         // make sure that any items are correctly
//         // URL encoded in the connection string
//         // console.log("Entrou try");
//         return sqlConnection.connect(sqlConfig).then((pool) => {
//           // pool.sqlConnection.connect(sqlConfig);
//           // console.log("Entrou connect");
//           let sql = "";
//           if (ambiente == "teste") {
//             sql = "SELECT * ";
//             sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
//             sql = sql + "WHERE  IDAtendimento IS NULL ";
//             sql = sql + "AND  DataMarcada >= '2025-03-11' ";
//             sql = sql + "AND  DataMarcada < '2025-03-12' ";
//             sql = sql + "ORDER BY DataMarcada";
//           } else {
//             sql = "SELECT * ";
//             sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
//             sql = sql + "WHERE  IDAtendimento IS NULL ";
//             sql = sql + "AND  DataMarcada < DATEADD(dd," + 0 + ",";
//             sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//             sql = sql + ",0,0,0,0)) ";
//             sql = sql + "AND  DataMarcada >= DATEADD(dd," + -1 + ",";
//             sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//             sql = sql + ",0,0,0,0)) ";
//             sql = sql + "ORDER BY DataMarcada";
//           }
//           return pool.query(sql);
//           // const result = pool.query(sql);
//         }).then((result) => {
//           // console.log("result sql faltosos:",
//           // JSON.stringify(result, null, 2));

//           const db = admin.database();
//           const ref = db.ref("OFT/45/pacientesFaltosos/AEnviar");
//           ref.set(null);
//           db.ref("OFT/45/pacientesFaltosos/erro").set(null);

//           // console.log(JSON.stringify(result.recordset[0]));
//           // console.log(JSON.stringify(result));

//           result.recordset.forEach((element) => {
//             // if (!ultDataMarcada ||
//             // (element.DataMarcada !== ultDataMarcada &&
//             //  element.IDMarcacao !== ultIDMarcacao)) {
//             //
//             const year = element.DataMarcada.getFullYear();
//             const mm = element.DataMarcada.getMonth()+1;
//             const dd = element.DataMarcada.getDate();
//             const hh = element.DataMarcada.getHours();
//             let min = element.DataMarcada.getMinutes();
//             if (min == 0 ) {
//               min = "00";
//             }
//             const dataMarcada = dd + "/" + mm + "/" +
//               year + "  " + hh + ":" + min;
//             element.DataMarcada = dataMarcada;
//             ref.push(element);
//             contWhatsApp = contWhatsApp +1;
//             // ultDataMarcada = element.DataMarcada;
//             // ultIDMarcacao = element.IDMarcacao;
//           });
//           // ref.set(true);
//           // resp.end("Ok"+ resp.status.toString() +
//           // "\n\nmensagens lidas: " + contWhatsApp);
//           return null;
//         });
//       } catch (err) {
//         // ... error checks
//         console.log("Erro try: " + JSON.stringify(err));
//       }
//     });


// exports.oft45PacientesFaltososZApi =
//     functions.database.ref("OFT/45/pacientesFaltosos/AEnviar/{pushId}")
//         .onWrite((change, context) => {
//           console.log("Entrou no oft45PacientesFaltososZApi");
//           // Only edit data when it is first created.
//           // if (change.before.exists()) {
//           // return null;
//           // }
//           // Exit when the data is deleted.
//           if (!change.after.exists()) {
//             return null;
//           }
//           const db = admin.database();
//           let parametros = {};

//        // Grab the current value of what was written to the Realtime Database
//           const element = change.after.val();
//           console.log(JSON.stringify(element));
//           // const endereco = "Praça Saenz Pena 45, sala 1508";
//           // console.log("forEach. element:" + JSON.stringify(element));
//           let paciente = "";
//           let dataMarcada = "";
//           let medico = "";
//           let whatsAppCel = "";
//           // let convenio = "";

//           if (element.Paciente) {
//             paciente = element.Paciente;
//           }
//           if (element.DataMarcada) {
//             dataMarcada = element.DataMarcada;
//           }
//           if (element.Medico) {
//             medico = element.Medico;
//           }

//           if (medico != medicoAusente &&
//             medico != medicoAusente2 &&
//             medico != medicoAusente3 &&
//             medico != "Campo Visual") {
//             //
//             // --------------------------------------- sistema ASA
//             let Telefone = "";
//             let TelefoneCel = "";
//             let TelefoneCom = "";
//             let TelefoneRes = "";

//             let telCadastrado = "";
//             if (element.Telefone) {
//               telCadastrado = element.Telefone;
//             } else if (element.TelefoneCel) {
//               telCadastrado = element.TelefoneCel;
//             } else if (element.TelefoneRes) {
//               telCadastrado = element.TelefoneRes;
//             } else if (element.TelefoneCom) {
//               telCadastrado = element.TelefoneCom;
//             }

//             if (element.Telefone) {
//               Telefone = tel2Whats(element.Telefone);
//               console.log("Telefone: " + Telefone);
//             }
//             if (element.TelefoneCel) {
//               TelefoneCel = tel2Whats(element.TelefoneCel);
//               console.log("TelefoneCel: " + TelefoneCel);
//             }
//             if (element.TelefoneRes) {
//               TelefoneRes = tel2Whats(element.TelefoneRes);
//               console.log("TelefoneRes: " + TelefoneRes);
//             }
//             if (element.TelefoneCom) {
//               TelefoneCom = tel2Whats(element.TelefoneCom);
//               console.log("TelefoneCom: " + TelefoneCom);
//             }

//             if (Telefone != "") {
//               whatsAppCel = Telefone;
//             } else if (TelefoneCel != "") {
//               whatsAppCel = TelefoneCel;
//             } else if (TelefoneRes!= "") {
//               whatsAppCel = TelefoneRes;
//             } else if (TelefoneCom != "") {
//               whatsAppCel = TelefoneCom;
//             }

//             console.log("whatsAppCel: " + whatsAppCel);
//             if (whatsAppCel) {
//               // dd/mm/yyyy hh:mm
//               // const year = dataMarcada.split("/")[2].split(" ")[0];
//               // const mm = dataMarcada.split("/")[1];
//               // const dd = dataMarcada.split("/")[0];
//               // const hh = dataMarcada.substring(9, 10);
//               // const min = dataMarcada.substring(12, 13);

//               // if (medico == "Z Joao Ormonde") medico = "João Ormonde";
//               const whatsAppCelPaciente = whatsAppCel;
//               if (ambiente == "teste") whatsAppCel = "5521971938840";

//               let message1 = "";
//               if (medico == "Glaucoma") {
//                 message1 = "Olá! Aqui é da Oftalmo Day." +
//               "\n\nNa data 02/03/2024, o(a) paciente " + paciente +
//               " participaria do evento de " + medico +"." +
//               "\n\nVimos que não pôde comparecer. " +
//               "Gostaria de estar agendando uma consulta? ";
//               } else {
//                 // message1 = "Olá! Aqui é da Oftalmo Day." +
//              // "\n\nNa data " + dataMarcada + ", o(a) paciente "+paciente +
//              // " tinha uma consulta agendada com o Dr(a). " + medico +"." +
//                 // "\n\nVimos que não pôde comparecer. " +
//                 // "Gostaria de estar reagendando sua nova consulta? ";
//                 message1 = "Olá! Aqui é da Oftalmo Day." +
//                 "\n\nNa data " + dataMarcada.split(" ")[0] +
//                 " às " + dataMarcada.split(" ")[2] +
//                 ", o(a) paciente " + paciente +
//              " tinha uma consulta agendada com o(a) Dr(a). " + medico +"." +
//                 "\n\nVimos que não pôde comparecer. " +
//                 "Gostaria de estar reagendando uma nova consulta? 😊";
//               }

//               if (ambiente == "teste") {
//                 message1 = whatsAppCelPaciente + "\n" + message1;
//               }

//               if (ambiente == "teste") {
//                 parametros = {
//                   whatsAppCel: whatsAppCel,
//                   id: "3B74CE9AFF0D20904A9E9E548CC778EF",
//                   token: "A8F754F1402CAE3625D5D578",
//                   // buttonList: buttonList,
//                 };
//               } else {
//                 parametros = {
//                   whatsAppCel: whatsAppCel,
//                   id: "39C7A89881E470CC246252059E828D91",
//                   token: "B1CA83DE10E84496AECE8028",
//                   // buttonList: buttonList,
//                 };
//               }

//               const arrMessage = [{
//                 "phone": whatsAppCel,
//                 "message": message1,
//               }];
//               const i = 0;
//               callZapiV3(arrMessage, parametros, i);
//               //
//             } else {
//               const refAEnviarErro = db
//                   .ref("OFT/45/pacientesFaltosos/erro");

//               refAEnviarErro.set(null);

//               // envio de mensagem de relatorio de erro
//               const message1 = "PACIENTE *ERRO FALTOSOS*:" +
//               "\nNOME: " + paciente +
//               "\nMÉDICO: " + medico +
//               "\nDATA/HORA: " + dataMarcada +
//               "\nTELEFONES CADASTRADOS: " + telCadastrado;

//               refAEnviarErro.set(JSON.stringify(message1));

//               let parametros = {};
//               if (ambiente == "teste") {
//                 whatsAppCel = "5521971938840";

//                 parametros = {
//                   whatsAppCel: whatsAppCel,
//                   id: "3B74CE9AFF0D20904A9E9E548CC778EF",
//                   token: "A8F754F1402CAE3625D5D578",
//                 };
//               } else {
//                 whatsAppCel = "5521994931662";

//                 parametros = {
//                   whatsAppCel: whatsAppCel,
//                   id: "39C7A89881E470CC246252059E828D91",
//                   token: "B1CA83DE10E84496AECE8028",
//                 };
//               }
//               const arrMessage = [{
//                 "phone": whatsAppCel,
//                 "message": message1,
//               }];
//               const i = 0;
//               callZapiV3(arrMessage, parametros, i);
//             }
//             return null;
//           }
//         });


// exports.oft45PacientesFaltososErro = functions.pubsub
//     .schedule("25 07 * * *")
//     .timeZone("America/Sao_Paulo") // Users can choose timezone
//     .onRun((context) => {
//       console.log("Entrou Função pacientesFaltosos45Erro");
//       const db = admin.database();
//       const dbRef = admin.database();

//       dbRef.ref("pacientesFaltosos45AEnviar").once("value")
//           .then((snapshot) => {
//             if (snapshot.exists()) {
//               console.log("Entrou Get");
//               console.log(snapshot.val());
//               const pacientesNãoEnviados = snapshot.val();
//               const refErro= db.ref("pacientesFaltosos45Erro");
//               refErro.set(pacientesNãoEnviados);
//               const ref = db.ref("pacientesFaltosos45AEnviar");
//               ref.set(true);
//               // ...
//             } else {
//               console.log("No data available");
//             }
//           }).catch((error) => {
//             console.error(error);
//           });
//       return null;
//     });


// FUNÇÃO ORIGINAL PESQUISA DE SATISFAÇÃO
// // exports.oft45PesquisaSatisfacaoJson = functions.https.
// //     onRequest((req, resp) => {
// exports.oft45PesquisaSatisfacaoJson = functions.pubsub
//     .schedule("30 07 * * *")
//     .timeZone("America/Sao_Paulo") // Users can choose timezone
//     .onRun((context) => {
//       console.log("Entrou Função oft45PesquisaSatisfacaoJson");
//       const today = new Date();
//       const year = today.getFullYear();
//       const mm = today.getMonth()+1;
//       const dd = today.getDate();
//       let contWhatsApp = 0;
//       // const diaDaSemana = today.getDay();
//       try {
//         // make sure that any items are correctly
//         // URL encoded in the connection string
//         // console.log("Entrou try");
//         return sqlConnection.connect(sqlConfig).then((pool) => {
//           // pool.sqlConnection.connect(sqlConfig);
//           // console.log("Entrou connect");
//           let sql = "";
//           if (ambiente == "teste") {
//             sql = "SELECT * ";
//             sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
//             sql = sql + "WHERE  IDAtendimento IS NOT NULL ";
//             sql = sql + "AND  DataMarcada >= '2025-03-10' ";
//             sql = sql + "AND  DataMarcada < '2025-03-11' ";
//             sql = sql + "ORDER BY DataMarcada";
//           } else {
//             sql = "SELECT * ";
//             sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
//             sql = sql + "WHERE  IDAtendimento IS NOT NULL ";
//             sql = sql + "AND  DataMarcada < DATEADD(dd," + 0 + ",";
//             sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//             sql = sql + ",0,0,0,0)) ";
//             sql = sql + "AND  DataMarcada >= DATEADD(dd," + -1 + ",";
//             sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//             sql = sql + ",0,0,0,0)) ";
//             sql = sql + "ORDER BY DataMarcada";
//           }
//           return pool.query(sql);
//           // const result = pool.query(sql);
//         }).then((result) => {
//           const db = admin.database();
//           const ref = db.ref("OFT/45/pesquisaSatisfacao/aEnviar");
//           ref.set(null);

//           console.log(JSON.stringify(result.recordset[0]));
//           console.log(JSON.stringify(result));
//           result.recordset.forEach((element) => {
//             /*
//             const year = element.DataMarcada.substring(0, 3);
//             const mm = element.DataMarcada.substring(5, 6);
//             const dd = element.DataMarcada.substring(8, 9);
//             const hh = element.DataMarcada.substring(11, 12);
//             const min = element.DataMarcada.substring(14, 15);
//             */
//             const year = element.DataMarcada.getFullYear();
//             const mm = element.DataMarcada.getMonth()+1;
//             const dd = element.DataMarcada.getDate();
//             const hh = element.DataMarcada.getHours();
//             let min = element.DataMarcada.getMinutes();
//             if (min == 0 ) {
//               min = "00";
//             }
//             const dataMarcada = dd + "/" + mm + "/" +
//               year + "  " + hh + ":" + min;
//             element.DataMarcada = dataMarcada;
//             ref.push(element);
//             contWhatsApp = contWhatsApp + 1;
//           });
//           // resp.end("Ok"+ resp.status.toString() +
//           // "\n\nmensagens lidas: " + contWhatsApp);
//           // ref.set(true);
//           return null;
//         });
//       } catch (err) {
//         // ... error checks
//         console.log("Erro try: " + JSON.stringify(err));
//       }
//     });


// exports.oft45PesquisaSatisfacaoZApi =
//     functions.database.ref("OFT/45/pesquisaSatisfacao/aEnviar/{pushId}")
//         .onWrite((change, context) => {
//           // Only edit data when it is first created.
//           // if (change.before.exists()) {
//           // return null;
//           // }
//           // Exit when the data is deleted.
//           if (!change.after.exists()) {
//             return null;
//           }
//        // Grab the current value of what was written to the Realtime Database
//           const element = change.after.val();
//           console.log(JSON.stringify(element));

//           let paciente = "";

//           if (element.Paciente) {
//             paciente = element.Paciente;
//           }
//           let whatsAppCel = "";

//           // --------------------------------------- sistema ASA
//           let Telefone = "";
//           let TelefoneCel = "";
//           let TelefoneCom = "";
//           let TelefoneRes = "";

//           // let telCadastrado = "";
//           // if (element.Telefone) {
//           //   telCadastrado = element.Telefone;
//           // } else if (element.TelefoneCel) {
//           //   telCadastrado = element.TelefoneCel;
//           // } else if (element.TelefoneRes) {
//           //   telCadastrado = element.TelefoneRes;
//           // } else if (element.TelefoneCom) {
//           //   telCadastrado = element.TelefoneCom;
//           // }

//           if (element.Telefone) {
//             Telefone = tel2Whats(element.Telefone);
//             console.log("Telefone: " + Telefone);
//           }
//           if (element.TelefoneCel) {
//             TelefoneCel = tel2Whats(element.TelefoneCel);
//             console.log("TelefoneCel: " + TelefoneCel);
//           }
//           if (element.TelefoneRes) {
//             TelefoneRes = tel2Whats(element.TelefoneRes);
//             console.log("TelefoneRes: " + TelefoneRes);
//           }
//           if (element.TelefoneCom) {
//             TelefoneCom = tel2Whats(element.TelefoneCom);
//             console.log("TelefoneCom: " + TelefoneCom);
//           }

//           if (Telefone != "") {
//             whatsAppCel = Telefone;
//           } else if (TelefoneCel != "") {
//             whatsAppCel = TelefoneCel;
//           } else if (TelefoneRes!= "") {
//             whatsAppCel = TelefoneRes;
//           } else if (TelefoneCom != "") {
//             whatsAppCel = TelefoneCom;
//           }

//           // console.log("whatsAppCel: " + whatsAppCel);
//           if (whatsAppCel) {
//             // const message1 = "Olá! Aqui é da Oftalmo Day."+
//             // "\n\nObrigado por nos escolher para o atendimento de " +
//             // paciente + "." +
//             // "\n\nPara que possamos melhorar ainda mais, clique no link " +
//             // "e responda anonimamente a apenas 3 perguntas. " +
//             // "(leva em média 1 minuto)." +
//             // "\n\nhttps://form.typeform.com/to/lPymEzCA" +
//             //  "\n\nObrigado e até a próxima consulta.";

//             let message1 = "Olá! Aqui é da Oftalmo Day." +
//             "\n\nObrigado por nos escolher para o atendimento de " +
//             paciente + "." +
//             "\n\nPara que possamos melhorar ainda mais, por favor clique " +
//             "no link, avalie-nos no Google e deixe um comentário " +
//             "(leva em média 1 minuto). " +
//             "\n\nSua opinião é muito importante para nós! " +
//             "\n\n  https://g.page/r/CfkFYbj9RhlpEBM/review " +
//             "\n\nObrigado e até a próxima consulta.";

//             if (ambiente == "teste") {
//               message1 = whatsAppCel + "\n\n" + message1;
//             }

//          if (ambiente == "teste") whatsAppCel = "5521971938840"; // gabriel

//             if (whatsAppCel) {
//               let parametros = {};
//               if (ambiente == "teste") {
//                 parametros = {
//                   whatsAppCel: whatsAppCel,
//                   id: "3B74CE9AFF0D20904A9E9E548CC778EF",
//                   token: "A8F754F1402CAE3625D5D578",
//                   // optionList: optionList,
//                 };
//               } else {
//                 parametros = {
//                   whatsAppCel: whatsAppCel,
//                   id: "39C7A89881E470CC246252059E828D91",
//                   token: "B1CA83DE10E84496AECE8028",
//                   // optionList: optionList,
//                 };
//               }
//               const arrUrls = [message1];
//               const arrMessageType = ["text"];
//               const i = 0;
//               callZapiV2(arrUrls, arrMessageType, parametros, i);
//             }
//           }
//           return null;
//         });


// console.log(message1);
// Z-API
// console.log("Vai executar XMLHttpRequest.");
// const postData = JSON.stringify({
//   "phone": whatsAppCel,
//   "message": message1,
// });

// const req = new XMLHttpRequest();
// const urlZapi = "https://api.z-api.io/instances/" +
//   "39C7A89881E470CC246252059E828D91/token/" +
//   "B1CA83DE10E84496AECE8028/send-text";
// req.open("POST", urlZapi, true);
// req.setRequestHeader("Content-Type", "application/json");
// req.setRequestHeader("Client-Token",
//     "Fe948ba6a317942849b010c88cd9e6105S");
/*
    req.onreadystatechange = () => {
      console.log("Entrou readyState: " + req.readyState);
    };
    */
// req.onerror = () => {
//   console.log("Entrou onerror: " + req.statusText);
// };
// req.onload = () => {
//   console.log("Entrou onload. req.status: " + req.status);
//   if (req.status == 200) {
//     console.log("Z-API chamado com sucesso: " + whatsAppCel);
//     let refEnviados = db.ref("pesquisaSatisfacao45Enviados");
//     console.log(dataMarcada);
//     console.log(year+"/"+mm+"/"+dd);
//     refEnviados = refEnviados.child(year+"/"+mm+"/"+dd);
//     refEnviados.push(element);
//     const pushID = context.params.pushId;
//     const refAEnviar = db.ref("pesquisaSatisfacao45AEnviar/" +
//        pushID);
//     refAEnviar.set(null);
//   } else {
//     console.log("Erro chamando Z-API.");
//   }
// };
// setTimeout(function() {
// req.send(postData);
// }, 500);
//   req.send(postData);
//   console.log("req.send(postData): " + postData);
// }
// You must return a Promise when performing
// asynchronous tasks inside a Functions such as
// writing to the Firebase Realtime Database.
// Setting an "uppercase" sibling
// in the Realtime Database returns a Promise.
//   return null;
// });


// exports.oft45PesquisaSatisfacaoErro = functions.pubsub
//     .schedule("35 07 * * *")
//     .timeZone("America/Sao_Paulo") // Users can choose timezone
//     .onRun((context) => {
//       console.log("Entrou Função pesquisa de Satifação Erro");
//       const db = admin.database();
//       const dbRef = admin.database();

//       dbRef.ref("pesquisaSatisfacao45AEnviar").once("value")
//           .then((snapshot) => {
//             if (snapshot.exists()) {
//               console.log("Entrou Get");
//               console.log(snapshot.val());
//               const pacientesNãoEnviados = snapshot.val();
//               const refErro= db.ref("pesquisaSatisfacao45Erro");
//               refErro.set(pacientesNãoEnviados);
//               const ref = db.ref("pesquisaSatisfacao45AEnviar");
//               ref.set(true);
//               // ...
//             } else {
//               console.log("No data available");
//             }
//           }).catch((error) => {
//             console.error(error);
//           });
//       return null;
//     });


// exports.oft45ReconfirmacaocriarNoTeste = functions.https.
//     onRequest((req, resp) => {
//       console.log("Entrou no criar nó");
//       const db = admin.database();
//       db.ref("OFT/45/reconfirmacaoPacientes/AEnviar/")
//           .set(true);
//       // db.ref("OFT/45/reconfirmacaoPacientes/
//       // reconfirmacaoPacientes45Enviados/").set(true);
//     // db.ref("OFT/45/reconfirmacaoPacientes/reconfirmacaoPacientes45Erro/")
//       //     .set(true);
//       resp.end("Ok\n"+resp.status.toString());
//     });

// exports.oft45ReconfirmacaoPacientesJson = functions.https.
// onRequest(async (req, resp) => {
// exports.oft45ReconfirmacaoPacientesJson = functions.pubsub
//     .schedule("05 05 * * 1-6") // 0 = domingo, 6 = sábado
//     .timeZone("America/Sao_Paulo")
//     .onRun(async (context) => {
//       //
//       console.log("Entrou Função oft45ReconfirmacaoPacientesJson");

//       const db = admin.database();
//       db.ref("OFT/45/reconfirmacaoPacientes/erro").set(null);

//       // verificarDadosNaView();
//       let contWhatsApp = 0;
//       let contWhatsAppAEnviar = 0;
//       let contWhatsAppErro = 0;
//       const today = new Date();
//       const year = today.getFullYear();
//       const mm = today.getMonth()+1;
//       const dd = today.getDate();
//       const diaDaSemana = today.getDay();
//       // let ultDataMarcada = null;
//       // let ultIDMarcacao = null;

//       if (diaDaSemana != 0) {
//         try {
//           return sqlConnection.connect(sqlConfig).then((pool) => {
//             // pool.sqlConnection.connect(sqlConfig);
//             console.log("Entrou connect");
//             let sql = "";
//             if (ambiente == "teste") {
//               sql = "SELECT * ";
//               sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
//               sql = sql + "WHERE  DataMarcada >= '2025-07-08' ";
//               sql = sql + "AND  DataMarcada < '2025-07-09' ";
//               sql = sql + "ORDER BY DataMarcada";
//             } else {
//               // SELECT unico
//               // sql = "SELECT * ";
//               // sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
//               // sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 2 + ",";
//               // sql = sql +
// "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//               // sql = sql + ",0,0,0,0)) ";
//               // sql = sql + "AND  DataMarcada < DATEADD(dd," + 3 + ",";
//               // sql = sql +
// "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//               // sql = sql + ",0,0,0,0)) ";
//               // sql = sql + "ORDER BY DataMarcada";

//               sql = "SELECT * ";
//               sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
//               sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 0 + ",";
//               sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//               sql = sql + ",0,0,0,0)) ";
//               sql = sql + "AND  DataMarcada < DATEADD(dd," + 3 + ",";
//               sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//               sql = sql + ",0,0,0,0)) ";
//               sql = sql + "ORDER BY DataMarcada";
//             }

//             return pool.query(sql);
//             // const result = pool.query(sql);
//           }).then((result) => {
//             const refAEnviar =
// db.ref("OFT/45/reconfirmacaoPacientes/aEnviar");
//             const refAErro = db.ref("OFT/45/reconfirmacaoPacientes/erro");

//             refAEnviar.set(null);
//             refAErro.set(null);

//             const dadosFiltrados =
//             limparDuplicatasPorIDMarcacao(result.recordset);

//             console.log("dadosFiltrados:", dadosFiltrados);


//             dadosFiltrados.forEach((element) => {
//               if (ambiente === "teste" && contWhatsApp >= 3) {
//                 console.log("Ambiente Teste - 3 mesnsagens enviadas");
//                 return null;
//               }
//               // if (!ultDataMarcada ||
//               //     (element.DataMarcada !== ultDataMarcada &&
//               //       element.IDMarcacao !== ultIDMarcacao)) {
//               //
//               const year = element.DataMarcada.getFullYear();
//               const mm = element.DataMarcada.getMonth()+1;
//               const dd = element.DataMarcada.getDate();
//               const hh = element.DataMarcada.getHours();
//               let min = element.DataMarcada.getMinutes();
//               if (min == 0 ) {
//                 min = "00";
//               }
//               const dataMarcada = dd + "/" + mm + "/" +
//                 year + "  " + hh + ":" + min;
//               element.DataMarcada = dataMarcada;

//               // Se tel paciente é válido -> salva aEnviar
//               // Se tel paciente não é válido -> salva erro
//               let whatsAppCel = "";
//               let Telefone = "";
//               let TelefoneCel = "";
//               let TelefoneCom = "";
//               let TelefoneRes = "";
//               let medico = "";

//               if ((element.Convenio) &&
//                 (element.Convenio === "Particular Oft")) {
//                 element.Convenio = "Particular";
//               }

//               if (element.Telefone) {
//                 Telefone = tel2Whats(element.Telefone);
//                 console.log("Telefone: " + Telefone);
//               }
//               if (element.TelefoneCel) {
//                 TelefoneCel = tel2Whats(element.TelefoneCel);
//                 console.log("TelefoneCel: " + TelefoneCel);
//               }
//               if (element.TelefoneRes) {
//                 TelefoneRes = tel2Whats(element.TelefoneRes);
//                 console.log("TelefoneRes: " + TelefoneRes);
//               }
//               if (element.TelefoneCom) {
//                 TelefoneCom = tel2Whats(element.TelefoneCom);
//                 console.log("TelefoneCom: " + TelefoneCom);
//               }

//               if (Telefone != "") {
//                 whatsAppCel = Telefone;
//               } else if (TelefoneCel != "") {
//                 whatsAppCel = TelefoneCel;
//               } else if (TelefoneRes!= "") {
//                 whatsAppCel = TelefoneRes;
//               } else if (TelefoneCom != "") {
//                 whatsAppCel = TelefoneCom;
//               }

//               if (element.Medico) {
//                 medico = element.Medico;
//                 console.log("medico: " + medico);
//               }

//               console.log("whatsAppCel: " + whatsAppCel);

//               if (medico != medicoAusente &&
//                   medico != medicoAusente2 &&
//                   medico != medicoAusente3) {
//                 //
//                 if (whatsAppCel) {
//                   element.WhatsAppCel = whatsAppCel;
//                   refAEnviar.push(element);
//                   contWhatsAppAEnviar = contWhatsAppAEnviar + 1;
//                 } else {
//                   refAErro.push(element);
//                   contWhatsAppErro = contWhatsAppErro + 1;
//                 }
//                 contWhatsApp = contWhatsApp + 1;
//               }
//             });
//             console.log("mensagens lidas: " + contWhatsApp);
//             // refAEnviar.set(true);
//             // resp.end("Ok"+resp.status.toString() +
//             // "\n\nmensagens lidas: " + contWhatsApp);
//             return null;
//           });
//         } catch (err) {
//           // ... error checks
//           console.log("Erro try: " + JSON.stringify(err));
//         }
//       }
//     });


// FUNÇÃO RECONFIRMAÇÃO PACIENTES ORIGINAL
// exports.oft45ReconfirmacaoPacientesJson = functions.https.
// onRequest(async (req, resp) => {
// exports.oft45ReconfirmacaoPacientesJson = functions.pubsub
//     .schedule("*/2 7 * * 1-6")
//     .timeZone("America/Sao_Paulo") // Users can choose timezone
//     .onRun(async (context) => {
//       //
//       console.log("Entrou Função oft45ReconfirmacaoPacientesJson ");

//       const db = admin.database();
//       db.ref("OFT/45/reconfirmacaoPacientes/erro").set(null);

//       let contWhatsApp = 0;
//       const today = new Date();
//       const year = today.getFullYear();
//       const mm = today.getMonth()+1;
//       const dd = today.getDate();

//       try {
//         const refBase = db.ref("OFT/45/reconfirmacaoPacientes");
//         const refAEnviar = refBase.child("aEnviar");
//         const refEnviados = refBase.child("enviados");
//         const refMeta = refBase.child("ultimaLeituraSql");

//         const hoje = today.toISOString().slice(0, 10);
//         const lastLoad =
// (await refMeta.child("lastLoad").once("value")).val();

//         const filaSnap = await refAEnviar.limitToFirst(1).once("value");
//         if (!filaSnap.exists() && lastLoad !== hoje) {
//           await refEnviados.set(null);
//           const pool = await sqlConnection.connect(sqlConfig);
//           let sql = "";

//           console.log("Entrou connect");

//           if (ambiente == "teste") {
//             // Teste
//             // sql = "SELECT * ";
//             // sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
//             // sql = sql + "WHERE  DataMarcada >= '2025-07-08' ";
//             // sql = sql + "AND  DataMarcada < '2025-07-09' ";
//             // sql = sql + "ORDER BY DataMarcada";

//             // producao
//             sql = "SELECT * ";
//             sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
//             sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 0 + ",";
//             sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//             sql = sql + ",0,0,0,0)) ";
//             sql = sql + "AND  DataMarcada < DATEADD(dd," + 1 + ",";
//             sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//             sql = sql + ",0,0,0,0)) ";
//             sql = sql + "ORDER BY DataMarcada";
//             //
//           } else {
//             sql = "SELECT * ";
//             sql = sql + "FROM   dbo.vw_GSht_Age_Marcacao_Confirmacao ";
//             sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 0 + ",";
//             sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//             sql = sql + ",0,0,0,0)) ";
//             sql = sql + "AND  DataMarcada < DATEADD(dd," + 1 + ",";
//             sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//             sql = sql + ",0,0,0,0)) ";
//             sql = sql + "ORDER BY DataMarcada";
//           }

//           const {recordset} = await pool.query(sql);
//           const dadosFiltrados =
//           limparDuplicatasPorIDMarcacao(recordset);
//           for (const element of dadosFiltrados) {
//             if (ambiente === "teste" &&
//               contWhatsApp >= 20) break; // limite teste

//             const dt = element.DataMarcada;
//             element.DataMarcada =
//               `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}  ` +
//               `${dt.getHours()}:${dt.getMinutes()
// .toString().padStart(2, "0")}`;

//             const id = element.IDMarcacao.toString();
//             await refAEnviar.child(id).transaction((current) => {
//               // evita duplicação de dados
//               return current || element;
//             });
//             contWhatsApp++;
//           }

//           console.log(`Fila carregada com ${contWhatsApp} registros`);
//           await refMeta.child("lastLoad").set(hoje);

//           // resp.end("Ok"+ resp.status.toString() +
//           //     "\n\nmensagens lidas: " + contWhatsApp);
//           return null; // encerra – próxima execução cuidará do envio
//           //
//         } else if (!filaSnap.exists()) {
//           // MNENSAGENS JÁ FORAM ENVIADAS HOJE
//           console.log("Fila vazia e carga diária já feita - nada a fazer.");

//           // resp.end("Fila vazia e carga diária já feita - nada a fazer.");
//           return null;
//         }
//         //   fila aEnviar JÁ TEM DADOS:
//         //   pega 4 primeiros, move p/ 'enviados' e apaga da fila

//         const loteSnap = await refAEnviar.orderByKey()
//             .limitToFirst(4).once("value");

//         if (!loteSnap.exists()) {
//           console.log("Entrou no processo de enviar " +
//             "mensagens porem não há registros");
//           return null; // proteção extra
//         }

//         const updates = {};
//         loteSnap.forEach((child) => {
//           const id = child.key;
//           const dados = child.val();
//           updates[`enviados/${id}`] = dados; // cria em 'enviados'
//           updates[`aEnviar/${id}`] = null; // remove da fila
//         });
//         await refBase.update(updates);

//         console.log(`Movidos ${loteSnap.numChildren()}
//           registros para /enviados`);
//         // resp.end("Ok"+ resp.status.toString() +
//         //   "\n\n 4 mensagens enviadas");
//         return null;
//       } catch (err) {
//         console.log("Erro oft45ReconfirmacaoPacientesJson", err);
//         return null;
//       }
//     });


// exports.oft45ReconfirmacaoPacientesZApi =
//     functions.database.ref("OFT/45/reconfirmacaoPacientes/enviados/{pushId}")
//         .onCreate((snapshot, context) => {
//           //
//           console.log("Entrou oft45ReconfirmacaoPacientesZApi");
//           const db = admin.database();

//           const element = snapshot.val();
//           console.log(JSON.stringify(element));

//           let paciente = "";
//           let dataMarcada = "";
//           let medico = "";
//           let whatsAppCel = "";
//           let message1 = "";

//           if (element.Paciente) {
//             paciente = element.Paciente;
//           }
//           if (element.DataMarcada) {
//             dataMarcada = element.DataMarcada;
//           }
//           if (element.Medico) {
//             medico = element.Medico;
//           }

//           let telCadastrado = "";
//           let Telefone = "";
//           let TelefoneCel = "";
//           let TelefoneCom = "";
//           let TelefoneRes = "";

//           let auxTelefone = "";
//           let auxTelefoneCel = "";
//           let auxTelefoneCom = "";
//           let auxTelefoneRes = "";

//           if (element.Telefone) {
//             Telefone = tel2Whats(element.Telefone);
//             auxTelefone = element.Telefone + " / ";
//             console.log("Telefone: " + Telefone);
//           }
//           if (element.TelefoneCel) {
//             TelefoneCel = tel2Whats(element.TelefoneCel);
//             auxTelefoneCel = element.TelefoneCel + " / ";
//             console.log("TelefoneCel: " + TelefoneCel);
//           }
//           if (element.TelefoneRes) {
//             TelefoneRes = tel2Whats(element.TelefoneRes);
//             auxTelefoneRes = element.TelefoneRes + " / ";
//             console.log("TelefoneRes: " + TelefoneRes);
//           }
//           if (element.TelefoneCom) {
//             TelefoneCom = tel2Whats(element.TelefoneCom);
//             auxTelefoneCom = element.TelefoneCom;
//             console.log("TelefoneCom: " + TelefoneCom);
//           }

//           if (Telefone != "") {
//             whatsAppCel = Telefone;
//           } else if (TelefoneCel != "") {
//             whatsAppCel = TelefoneCel;
//           } else if (TelefoneRes!= "") {
//             whatsAppCel = TelefoneRes;
//           } else if (TelefoneCom != "") {
//             whatsAppCel = TelefoneCom;
//           } else {
//             telCadastrado = auxTelefone + auxTelefoneCel +
//             auxTelefoneRes + auxTelefoneCom;
//           }

//           if (medico != medicoAusente &&
//             medico != medicoAusente2 &&
//             medico != medicoAusente3) {
//             const whatsAppCelPaciente = whatsAppCel;
//             console.log("whatsAppCel: " + whatsAppCel);
//             if (whatsAppCel) {
//               // if (medico == "Z Joao Ormonde") medico = "João Ormonde";

//               const complementoMessage1 = "\n\n📍 Caso necessite de " +
//                 "declaração de comparecimento ou emissão de Nota Carioca, " +
//                 "solicitamos que o pedido seja feito no dia da consulta, " +
//                 "diretamente na recepção da clínica. Se a solicitação for " +
//                 "feita posteriormente, o prazo para entrega " +
//                 "será de até 24 horas.";

//               if (medico == "Campo Visual") {
//              message1 = "*Olá, bom dia!* \n*Somos da clínica Oftalmo Day!*" +
//            "\nPassando para lembrar do exame " + medico + " do paciente " +
//                 paciente + " para *HOJE*, dia " +
//              dataMarcada.split(" ")[0] + " às " + dataMarcada.split(" ")[2] +
//                 ".";
//               // } else if (medico == "Retina") {
//               //   message1 = "Olá! Aqui é da Oftalmo Day." +
//               //   "\nSua participação no *Evento de " +
//               //   "Prevenção a Retinopatia Diabética* está confirmada." +
//               //   "\n\n*Paciente:* " + paciente +
//               //   "\n*Data:* 29/06/2024 (sábado)" +
//               //   "\n\nAguardamos sua presença!!!";
//               // }
//               } else {
//              message1 = "*Olá, bom dia!* \n*Somos da clínica Oftalmo Day!*" +
//                 "\nPassando para lembrar do agendamento do paciente " +
//                 paciente + " para *HOJE*, dia " +
//              dataMarcada.split(" ")[0] + " às " + dataMarcada.split(" ")[2] +
//                 " com o(a) Dr(a) " + medico + "." + complementoMessage1;
//               }
//             } else {
//               // envio de mensagem de relatorio de erro
//               message1 = "PACIENTE *ERRO RECONFIRMAÇÃO*:" +
//               "\nNOME: " + paciente +
//               "\nMÉDICO: " + medico +
//               "\nDATA/HORA: " + dataMarcada +
//               "\n\nTELEFONES CADASTRADOS: " + telCadastrado;

//               db.ref("OFT/45/reconfirmacaoPacientes/erro/")
//                   .push(JSON.stringify(message1));

//               whatsAppCel = "5521994931662"; // OFT
//               //
//             }
//             if (ambiente == "teste") {
//               message1 = message1 + "\n\n" + whatsAppCelPaciente;
//             }

//             let parametros = {};
//             if (ambiente == "teste") {
//               whatsAppCel = "5521971938840";

//               parametros = {
//                 whatsAppCel: whatsAppCel,
//                 id: "3B74CE9AFF0D20904A9E9E548CC778EF",
//                 token: "A8F754F1402CAE3625D5D578",
//               };
//             } else {
//               parametros = {
//                 whatsAppCel: whatsAppCel,
//                 id: "39C7A89881E470CC246252059E828D91",
//                 token: "B1CA83DE10E84496AECE8028",
//               };
//             }
//             // callZapiV3
//             const arrMessage = [{
//               "phone": whatsAppCel,
//               "message": message1,
//             }];

//             console.log("arrMessage: " + JSON.stringify(arrMessage));
//             console.log("parametros: " + JSON.stringify(parametros));

//             const i = 0;
//             callZapiV3(arrMessage, parametros, i);

//             return null;
//           } else {
//             const pushID = context.params.pushId;
//             const refAEnviar = db.ref(
//                 "OFT/45/reconfirmacaoPacientes/" +
//                   "aEnviar/" + pushID);
//             refAEnviar.set(null);
//           }
//         });


// exports.oft45ReconfirmacaoPacientes45Erro = functions.https.
//     onRequest((req, resp) => {
// exports.oft45ReconfirmacaoPacientesErro = functions.pubsub
//     .schedule("15 07 * * *")
//     .timeZone("America/Sao_Paulo") // Users can choose timezone
//     .onRun((context) => {
//       console.log("Entrou Função reconfirmacaoPacientes45Erro ");
//       const db = admin.database();
//       const dbRef = admin.database();

//    dbRef.ref("OFT/45/reconfirmacaoPacientes/reconfirmacaoPacientes45AEnviar")
//           .once("value")
//           .then((snapshot) => {
//             if (snapshot.exists()) {
//               console.log("Entrou Get");
//               console.log(snapshot.val());
//               const pacientesNãoEnviados = snapshot.val();
//               const refErro = db.ref(
//                "OFT/45/reconfirmacaoPacientes/reconfirmacaoPacientes45Erro");
//               refErro.set(pacientesNãoEnviados);
//               const ref = db.ref("OFT/45/reconfirmacaoPacientes/" +
//                   "reconfirmacaoPacientes45AEnviar");
//               ref.set(true);
//               // ...
//             } else {
//               console.log("No data available");
//             }
//           }).catch((error) => {
//             console.error(error);
//           });
//       return null;
//       // resp.end("Ok\n"+resp.status.toString());
//     });


exports.oft45MensagemRecebidaZApiWH = functions.https.
    onRequest((req, resp) => {
      cors(req, resp, () => {
        console.log("Entrou em oft45MensagemRecebidaZApiWH");

        sqlConfig = {
          user: functions.config().sqlserver.usuario,
          password: functions.config().sqlserver.senha,
          database: "ASADB",
          server: "oftalclinsrv.no-ip.org",
          pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 3000000,
          },
          options: {
            encrypt: true, // for azure
            trustServerCertificate: true,
            // change to true for local dev / self-signed certs
          },
        };

        let sendMsg = "";
        let optionList = {};
        // let postData = "";
        let dadosCancelar = {};
        let receivedID = "";
        let IDMarcacao = "";
        let paciente = "";
        const db = admin.database();

        // button-list
        if (
          req.body.buttonsResponseMessage &&
          req.body.buttonsResponseMessage.buttonId) {
          receivedID = req.body.buttonsResponseMessage.buttonId;
        } else if (
          // option-list
          req.body.listResponseMessage &&
          req.body.listResponseMessage.selectedRowId) {
          receivedID = req.body.listResponseMessage.selectedRowId;
        }
        if (!receivedID) {
          console.log("Nenhum buttonId ou selectedRowId encontrado.");
          console.log("Body recebido:", JSON.stringify(req.body, null, 2));
          resp.status(200).end();
          return;
        }

        const whatsAppCel = req.body.phone.substring(2, 13);

        IDMarcacao = receivedID.split(/-/g)[1];
        paciente = receivedID.split(/-/g)[2];

        // chave ID
        console.log("\nchave ID -> "+ receivedID + "\n");
        console.log("\nNome do Paciente -> "+ paciente + "\n");

        const emojiUse1 = emoji.get("telephone_receiver"); // 📞
        const emojiUse2 = emoji.get("wave"); // 👋


        // BuscaAtiva45
        if (receivedID.match(/BSCATV45/g)) {
          if (receivedID.match(/BSCATV45-AGDCONS/g)) {
            console.log("Entrou if BSCATV45-AGDCONS");
            // sendMsg = "OK. A Amanda ou a Denise " +
            //   "já vão entrar em contato com você por aqui para agendar";
            sendMsg = emojiUse1 + " Em breve " +
            "entreremos em contato com você por aqui para agendar a consulta";
          }

          if (receivedID.match(/BSCATV45-LMBRFUT/g)) {
            console.log("Entrou if BSCATV45-LMBRFUT");
            sendMsg = "Quando deseja ser lembrado?";

            optionList = {
              // "title": "Opções disponíveis",
              "buttonLabel": "Clique aqui para responder",
              "options": [
                {
                  "id": "BSCATV45-LMBR2MESES",
                  "title": "Lembrar daqui a 2 meses",
                },
                {
                  "id": "BSCATV45-LMBR4MESES",
                  "title": "Lembrar daqui a 4 meses",
                },
                {
                  "id": "BSCATV45-LMBR6MESES",
                  "title": "Lembrar daqui a 6 meses",
                },
              ],
            };
          }

          if (receivedID.match(/BSCATV45-CANCMSG/g)) {
            console.log("Entrou if BSCATV45-CANCMSG");
            sendMsg = "OK, sem problemas."+
            "\n\nPoderia nos informar o motivo do cancelamento?";

            dadosCancelar = {
              Reenviar: "",
            };
            db.ref("OFT/45/_dadosComuns/cancelados/automatico/" +
                whatsAppCel).set(dadosCancelar);
          }


          if (receivedID.match(/BSCATV45-LMBR2MESES/g)) {
            console.log("Entrou if BSCATV45-LMBR2MESES");
            // sendMsg = "OK. daqui a 2 meses entraremos em
            // contato novamente. " + "Obrigado ";
            sendMsg = "OK. Daqui a 2 meses entraremos em contato novamente. " +
            "\nObrigado e até breve " + emojiUse2;

            const dataReenviar = new Date();
            dataReenviar.setDate(dataReenviar.getDate() + 60);

            dadosCancelar = {
              Reenviar: JSON.parse(JSON.stringify(dataReenviar)),
            };

            db.ref("OFT/45/_dadosComuns/cancelados/automatico/" +
            whatsAppCel).set(dadosCancelar);
          }

          if (receivedID.match(/BSCATV45-LMBR4MESES/g)) {
            console.log("Entrou if BSCATV45-LMBR4MESES");
            // sendMsg = "OK. daqui a 4 meses entraremos
            // em contato novamente. Obrigado ";
            sendMsg = "OK. Daqui a 4 meses entraremos em contato novamente. " +
            "\nObrigado e até breve " + emojiUse2;

            const dataReenviar = new Date();
            dataReenviar.setDate(dataReenviar.getDate() + 120);

            dadosCancelar = {
              Reenviar: JSON.parse(JSON.stringify(dataReenviar)),
            };

            db.ref("OFT/45/_dadosComuns/cancelados/automatico/" +
            whatsAppCel).set(dadosCancelar);
          }

          if (receivedID.match(/BSCATV45-LMBR6MESES/g)) {
            console.log("Entrou if BSCATV45-LMBR6MESES");
            // sendMsg = "OK. daqui a 6 meses entraremos em
            //  contato novamente. Obrigado ";
            sendMsg = "OK. Daqui a 6 meses entraremos em contato novamente. " +
            "\nObrigado e até breve " + emojiUse2;

            const dataReenviar = new Date();
            dataReenviar.setDate(dataReenviar.getDate() + 180);

            dadosCancelar = {
              Reenviar: JSON.parse(JSON.stringify(dataReenviar)),
            };

            db.ref("OFT/45/_dadosComuns/cancelados/automatico/" +
            whatsAppCel).set(dadosCancelar);
          }

          // buscaAtivaCatarata
          // } else if (receivedID.match(/BSCATVCTRT/g)) {
          //   if (receivedID.match(/BSCATVCTRT-AGDCONS/g)) {
          //     console.log("Entrou if BSCATVCTRT-AGDCONS");
          //     sendMsg = "OK. A Amanda ou a Denise " +
          //       "já vão entrar em contato com você por aqui para agendar";
          //   }
          //   if (receivedID.match(/BSCATVCTRT-LMBRFUT/g)) {
          //     console.log("Entrou if BSCATVCTRT-LMBRFUT");
          //     sendMsg = "Quando deseja ser lembrado?";
          // postData = JSON.stringify({
          //   "phone": whatsAppCel,
          //   "message": sendMsg,
          //   "buttonList": {
          //     "buttons": [
          //       {
          //         "id": "BSCATVCTRT-LMBR2MESES",
          //         "label": "2 meses",
          //       },
          //       {
          //         "id": "BSCATVCTRT-LMBR4MESES",
          //         "label": "4 meses",
          //       },
          //       {
          //         "id": "BSCATVCTRT-LMBR6MESES",
          //         "label": "6 meses",
          //       },
          //     ],
          //   },
          // });
          // }

          // if (receivedID.match(/BSCATVCTRT-CANCMSG/g)) {
          //   console.log("Entrou if BSCATVCTRT-CANCMSG");
          //   sendMsg = "OK, sem problemas."+
          //   "\n\nPoderia nos informar o motivo do cancelamento?";

          // postData = JSON.stringify({
          //   "phone": whatsAppCel,
          //   "message": sendMsg,
          // });
          // dadosCancelar = {
          //   Reenviar: "",
          // };

          // db.ref("/OFT/45/catarata/buscaAtivaCatarata/cancelados/" +
          //           whatsAppCel).set(dadosCancelar);
          //   db.ref("OFT/45/_dadosComuns/cancelados/automatico/" +
          //   whatsAppCel).set(dadosCancelar);
          // }

          // if (receivedID.match(/BSCATVCTRT-LMBR2MESES/g)) {
          //   console.log("Entrou if BSCATVCTRT-LMBR2MESES");
          //   sendMsg = "OK. daqui a 2 meses entraremos em " +
          //           "contato novamente. Obrigado ";
          // postData = JSON.stringify({
          //   "phone": whatsAppCel,
          //   "message": sendMsg,
          // });

          // const dataReenviar = new Date();
          // dataReenviar.setDate(dataReenviar.getDate() + 60);

          // dadosCancelar = {
          //   Reenviar: JSON.parse(JSON.stringify(dataReenviar)),
          // };

          // db.ref("/OFT/45/catarata/buscaAtivaCatarata/cancelados/" +
          //           whatsAppCel).set(dadosCancelar);
          //   db.ref("OFT/45/_dadosComuns/cancelados/automatico/" +
          //   whatsAppCel).set(dadosCancelar);
          // }

          // if (receivedID.match(/BSCATVCTRT-LMBR4MESES/g)) {
          //   console.log("Entrou if BSCATVCTRT-LMBR4MESES");
          //   sendMsg = "OK. daqui a 4 meses entraremos " +
          //           "em contato novamente. Obrigado ";
          // postData = JSON.stringify({
          //   "phone": whatsAppCel,
          //   "message": sendMsg,
          // });

          //   const dataReenviar = new Date();
          //   dataReenviar.setDate(dataReenviar.getDate() + 120);

          //   dadosCancelar = {
          //     Reenviar: JSON.parse(JSON.stringify(dataReenviar)),
          //   };

          //   // db.ref("/OFT/45/catarata/buscaAtivaCatarata/cancelados/" +
          //   //           whatsAppCel).set(dadosCancelar);
          //   db.ref("OFT/45/_dadosComuns/cancelados/automatico/" +
          //   whatsAppCel).set(dadosCancelar);
          // }

          // if (receivedID.match(/BSCATVCTRT-LMBR6MESES/g)) {
          //   console.log("Entrou if BSCATVCTRT-LMBR6MESES");
          //   sendMsg = "OK. daqui a 6 meses entraremos " +
          //   "em contato novamente. Obrigado ";
          // postData = JSON.stringify({
          //   "phone": whatsAppCel,
          //   "message": sendMsg,
          // });
          //     const dataReenviar = new Date();
          //     dataReenviar.setDate(dataReenviar.getDate() + 180);

          //     dadosCancelar = {
          //       Reenviar: JSON.parse(JSON.stringify(dataReenviar)),
          //     };

          //     // db.ref("/OFT/45/catarata/buscaAtivaCatarata/cancelados/" +
          //     //           whatsAppCel).set(dadosCancelar);
          //     db.ref("OFT/45/_dadosComuns/cancelados/automatico/" +
          //     whatsAppCel).set(dadosCancelar);
          //   }

          //   // buscaAtivaPalpebra
          // } else if (receivedID.match(/BSCATVPPBR/g)) {
          //   if (receivedID.match(/BSCATVPPBR-AGDCONS/g)) {
          //     console.log("Entrou if BSCATVPPBR-AGDCONS");
          //     sendMsg = "OK. A Amanda ou a Denise " +
          //       "já vão entrar em contato com você por aqui para agendar";
          // postData = JSON.stringify({
          //   "phone": whatsAppCel,
          //   "message": sendMsg,
          // });
          // }
          // if (receivedID.match(/BSCATVPPBR-LMBRFUT/g)) {
          //   console.log("Entrou if BSCATVPPBR-LMBRFUT");
          //   sendMsg = "Quando deseja ser lembrado?";
          // postData = JSON.stringify({
          //   "phone": whatsAppCel,
          //   "message": sendMsg,
          //   "buttonList": {
          //     "buttons": [
          //       {
          //         "id": "BSCATVPPBR-LMBR2MESES",
          //         "label": "2 meses",
          //       },
          //       {
          //         "id": "BSCATVPPBR-LMBR4MESES",
          //         "label": "4 meses",
          //       },
          //       {
          //         "id": "BSCATVPPBR-LMBR6MESES",
          //         "label": "6 meses",
          //       },
          //     ],
          //   },
          // });
          // }

          // if (receivedID.match(/BSCATVPPBR-CANCMSG/g)) {
          //   console.log("Entrou if BSCATVPPBR-CANCMSG");
          //   sendMsg = "OK, sem problemas."+
          //   "\n\nPoderia nos informar o motivo do cancelamento?";

          //   dadosCancelar = {
          //     Reenviar: "",
          //   };
          //   // db.ref("OFT/45/Arquivos/cancelados/" +
          //   //           whatsAppCel).set(dadosCancelar);
          //   db.ref("OFT/45/_dadosComuns/cancelados/automatico/" +
          //             whatsAppCel).set(dadosCancelar);
          // }


          // if (receivedID.match(/BSCATVPPBR-LMBR2MESES/g)) {
          //   console.log("Entrou if BSCATVPPBR-LMBR2MESES");
          //   sendMsg = "OK. daqui a 2 meses entraremos em " +
          //           "contato novamente. Obrigado ";

          //   const dataReenviar = new Date();
          //   dataReenviar.setDate(dataReenviar.getDate() + 60);

          //   dadosCancelar = {
          //     Reenviar: JSON.parse(JSON.stringify(dataReenviar)),
          //   };
          //   // db.ref("OFT/45/Arquivos/cancelados/" +
          //   //           whatsAppCel).set(dadosCancelar);
          //   db.ref("OFT/45/_dadosComuns/cancelados/automatico/" +
          //             whatsAppCel).set(dadosCancelar);
          // }

          // if (receivedID.match(/BSCATVPPBR-LMBR4MESES/g)) {
          //   console.log("Entrou if BSCATVPPBR-LMBR4MESES");
          //   sendMsg = "OK. daqui a 4 meses entraremos " +
          //           "em contato novamente. Obrigado ";

          //   const dataReenviar = new Date();
          //   dataReenviar.setDate(dataReenviar.getDate() + 120);

          //   dadosCancelar = {
          //     Reenviar: JSON.parse(JSON.stringify(dataReenviar)),
          //   };
          //   // db.ref("OFT/45/Arquivos/cancelados/" +
          //   //           whatsAppCel).set(dadosCancelar);
          //   db.ref("OFT/45/_dadosComuns/cancelados/automatico/" +
          //             whatsAppCel).set(dadosCancelar);
          // }

          // if (receivedID.match(/BSCATVPPBR-LMBR6MESES/g)) {
          //   console.log("Entrou if BSCATVPPBR-LMBR6MESES");
          //   sendMsg = "OK. daqui a 6 meses entraremos " +
          //   "em contato novamente. Obrigado ";

          //   const dataReenviar = new Date();
          //   dataReenviar.setDate(dataReenviar.getDate() + 180);

          //   dadosCancelar = {
          //     Reenviar: JSON.parse(JSON.stringify(dataReenviar)),
          //   };
          //   db.ref("OFT/45/_dadosComuns/cancelados/automatico/" +
          //             whatsAppCel).set(dadosCancelar);
          // }

          // if (ambiente == "teste" & testeCelularZApi == "on") {
          //   const chamarFunctionMsgReceb = "stop";
          //   celularZApi(postData, chamarFunctionMsgReceb);
          // } else {
          //   const request = new XMLHttpRequest();
          //   let urlZapi = "";
          //   if (ambiente == "teste") {
          //     // RDH
          //     urlZapi = "https://api.z-api.io/instances/" +
          //     "3B74CE9AFF0D20904A9E9E548CC778EF/token/" +
          //     "A8F754F1402CAE3625D5D578/send-text";
          //   } else {
          //     // 45
          //     urlZapi = "https://api.z-api.io/instances/" +
          //     "39C7A89881E470CC246252059E828D91/token/" +
          //     "B1CA83DE10E84496AECE8028/send-text";
          //   }
          //   request.open("POST", urlZapi, true);
          //   request.setRequestHeader("Content-Type", "application/json");
          //   request.send(postData);
          //   resp.status(200).end();
          //   request.onload = () => {
          //     if (request.status == 200) {
          //       // console.log("Z-API chamado com sucesso.");
          //       resp.status(200).end();
          //       return "Ok";
          //     } else {
          //       // console.log("Erro chamando Z-API.");
          //       return;
          //     }
          //   };
          // }
          // return null;
        } else if (receivedID.match(/CNFSIM/g)||receivedID.match(/CNFNAO/g)) {
          let novaObs = "";
          console.log("Entrou no if CNFSIM CNFNAO");

          if (receivedID.match(/CNFSIM/g)) {
            console.log("Entrou no if CNFSIM");
            novaObs = "CONFIRMADO";

            // sendMsg = "Ótimo! Consulta confirmada!" +
            //   "\n\nAlgumas recomendações importantes:" +
            //   "\n- Caso use lente de contato, favor retirar 24 horas " +
            //   "(lentes gelatinosas) ou 48 horas (lentes duras) " +
            //   "antes do exame ou da sua consulta!" +
            //   "\n- Para a realização do seu exame favor trazer " +
            //   "o pedido original datado e assinado." +
            //   "\n- Favor chegar com 15 min de antecedência." +
            //   "\n\nPara agilizar seu atendimento, *caso ainda não " +
            //   "seja cadastrado*, preencha seus " +
            //   "dados cadastrais acessando o link" +
            //   "\n https://form.typeform.com/to/DfmE0u0K#idmarcacao=" +
            //   IDMarcacao +
            //   "\n(caso não funcione, copie o endereço acima " +
            //   "e cole no navegador Google Chrome)." +
            //   "\n\nQualquer dúvida, pode nos chamar por aqui.";

            sendMsg = "Ótimo! 😄" +
              "\n" + paciente + ", *Consulta confirmada!*" +
              "\n\nAlgumas recomendações importantes:" +
              "\n- É necessário apresentar carteira de identidade, " +
              "e carteira do plano de saúde (fisica/digital)." +
              "\n- Caso use lente de contato, favor retirar 24 horas " +
              "(lentes gelatinosas) ou 48 horas (lentes duras) " +
              "antes do exame ou da sua consulta!" +
              "\n- Caso haja um pedido de exame, favor trazer " +
              "o original datado e assinado." +
              "\n- Favor chegar com 15 min de antecedência." +
              "\n\nQualquer dúvida, pode nos chamar por aqui.";
          //
          } else if (receivedID.match(/CNFNAO/g)) {
            const emojiUse1 = emoji.get("pleading"); // 🥺

            novaObs = "CANCELADO";
            sendMsg = "Poxa! É uma pena!!! " + emojiUse1 +
            "\n" + paciente + ", sua consulta foi *cancelada*" +
            "\nGostaria de reagendar a consulta?";
          }
          try {
            console.log("Entrou Try");
            sqlConnection.connect(sqlConfig).then((pool) => {
              let sql = "";
              sql = "SELECT Observacao ";
              sql = sql + "FROM dbo.Age_Marcacao ";
              sql = sql + "WHERE IDMarcacao = " + IDMarcacao;
              return pool.query(sql);
            }).then((result) => {
              console.log("Entrou no then result");
              const obsOld = result.recordset[0].Observacao;
              let sql2 = "";
              if (obsOld) {
                sql2 = "UPDATE dbo.Age_Marcacao ";
                sql2 = sql2 + "SET Observacao = '" + obsOld;
                sql2 = sql2 + ". " + novaObs + ".' ";
                sql2 = sql2 + "WHERE IDMarcacao = " + IDMarcacao;
              } else {
                sql2 = "UPDATE dbo.Age_Marcacao ";
                sql2 = sql2 + "SET Observacao = '" + novaObs + ".' ";
                sql2 = sql2 + "WHERE IDMarcacao = " + IDMarcacao;
              }
              const ReqASA = new sqlConnection.Request();
              ReqASA.query(sql2);
            });
          } catch (err) {
            // ... error checks
            console.log("Erro try: " + JSON.stringify(err));
          }
          console.log(novaObs);
        } else {
          resp.end();
          return;
        }
        console.log("Vai entrar no if sendMsg: " + sendMsg);
        if (sendMsg) {
          if (whatsAppCel) {
            console.log("Entrou no if whatsAppCel");
            let parametros = {};
            if (ambiente == "teste") {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                token: "A8F754F1402CAE3625D5D578",
                optionList: optionList,
              };
            } else {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "39C7A89881E470CC246252059E828D91",
                token: "B1CA83DE10E84496AECE8028",
                optionList: optionList,
              };
            }
            const arrUrls = [sendMsg];
            const arrMessageType = ["text"];
            const i = 0;
            callZapiV2(arrUrls, arrMessageType, parametros, i);
          }
        }
        console.log("finalizou!");
        resp.status(200).end();
      });
    });


exports.oft45MensagemRecebidaWaApiWH = functions
    .https.onRequest((req, resp) => {
      console.log("Entrou em oft45MensagemRecebidaWaApiWH");

      // "true" = COM modelo de mensagem, "false" = SEM modelo de mensagem'
      const modelo = "true";

      const VERIFY_TOKEN = "EAASy47UeDpQBPFBlxVeD2ZCnhV2Tvxeij399Niuc3" +
        "JSQSfO9cIySFi94gZCaEEGHZBYqzOZBAqjdZCM5ZBN" +
        "XxBPps4e1jZCgMlcZAiQjM1SuGUCObTa4JsbfNjAuJ" +
        "JXnCSOcZBZAxe6JoojTbqTWBZBtirGBTD95eaZCbeIU" +
        "39lHMqUqaF61siFiOpTkZAT6UlgcSoDvQWwZDZD";

      let nameSpace = "";
      let nomeModeloRespBotConfirmar = "";
      let nomeModeloRespBotCancelar = "";

      if (ambiente == "teste") {
        // nameSpace = "89afd918_f7f2_4f2d_b35e_ee84bcbb26b3";
        // nomeModeloRespBotConfirmar = "oft45_respbotaoconfirmacao_confirmada";
        // nomeModeloRespBotCancelar = "oft45_respbotaoconfirmacao_cancelada";
        //
        nameSpace = "35cd7039_9f0f_4dc3_b66b_c3929e2c3ef4";
        nomeModeloRespBotConfirmar =
          "oft45_respbotaoconfirmacao_confirmar_consulta";
        nomeModeloRespBotCancelar =
          "oft45_respbotaoconfirmacao_cancelar_consulta";
        //
      } else {
        nameSpace = "35cd7039_9f0f_4dc3_b66b_c3929e2c3ef4";
        nomeModeloRespBotConfirmar =
          "oft45_respbotaoconfirmacao_confirmar_consulta";
        nomeModeloRespBotCancelar =
          "oft45_respbotaoconfirmacao_cancelar_consulta";
      }

      sqlConfig = {
        user: functions.config().sqlserver.usuario,
        password: functions.config().sqlserver.senha,
        database: "ASADB",
        server: "oftalclinsrv.no-ip.org",
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 3000000,
        },
        options: {
          encrypt: true, // for azure
          trustServerCertificate: true,
          // change to true for local dev / self-signed certs
        },
      };

      if (req.method === "GET") {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
          console.log("WEBHOOK VERIFICADO");
          resp.status(200).send(challenge);
        } else {
          resp.sendStatus(403);
        }
        return;
      }

      // 2) POST de eventos
      const body = req.body;
      console.log("body: " + JSON.stringify(body));

      if (body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages.length > 0) {
        //
        const change = body.entry[0].changes[0].value;
        const message = change.messages[0];
        const from = message.from; // telefone do paciente
        const phoneNumberId = change.metadata.phone_number_id; // nosso número
        let receivedID = "";

        // resposta dos botões “SEM modelo pré‑aprovado”
        if (message.interactive &&
           message.interactive.type === "button_reply" &&
           message.interactive.button_reply &&
           message.interactive.button_reply.id) {
          //
          receivedID = message.interactive.button_reply.id;
          // resposta dos botões “COM modelo pré‑aprovado”
        } else if (message.type === "button" &&
            message.button &&
            message.button.payload) {
          receivedID = message.button.payload;
        }

        if (!receivedID) {
          console.log("Nenhum botão reconhecido.");
          resp.sendStatus(200);
          return;
        }

        // decompose o id (ex: CNFSIM-1234-Joao)
        const action = receivedID.split("-")[0]; // CNFSIM | CNFNAO
        const IDMarcacao = receivedID.split("-")[1];
        const paciente = receivedID.split("-").slice(2).join("-");

        let message1 = "";
        let novaObs = "";

        if (action === "CNFSIM" || action === "CNFNAO") {
          if (action === "CNFSIM") {
            // mensagem de confirmação
            message1 =
              "Ótimo! 😄\n" +
              paciente + ", *consulta confirmada!*" +
              "\n\nAlgumas recomendações importantes:" +
              "\n- É necessário apresentar carteira de " +
              "identidade, e carteira do plano de saúde (física/digital)." +
              "\n- Caso use lente de contato, favor retirar 24h (gelatinosas)" +
              " ou 48h (duras) antes da consulta." +
              "\n- Caso haja pedido de exame, traga o original datado " +
              "e assinado." +
              "\n- Chegue com 15 minutos de antecedência." +
              "\n\nQualquer dúvida, pode nos chamar por aqui.";

            novaObs = "CONFIRMADO";

            //
          } else if (action === "CNFNAO") {
            // mensagem de cancelamento
            message1 =
              "Poxa! É uma pena!!! 🥺\n" +
              paciente + ", sua consulta foi *cancelada*.\n" +
              "Gostaria de reagendar a consulta?";

            novaObs = "CANCELADO";
          } else {
            // se não for CNFSIM/CNFNAO
            resp.sendStatus(200);
            return;
          }

          try {
            // sqlConnection.connect(sqlConfig)
            //     .then((pool) => {
            //       const listaCols =
            //         `SELECT COLUMN_NAMEespaco
            //         FROM INFORMATION_SCHEMA.COLUMNS
            //         WHERE TABLE_SCHEMA = 'dbo'
            //           AND TABLE_NAME   = 'Age_Marcacao'`;
            //       return pool.query(listaCols);
            //     })
            //     .then((result) => {
            //       console.log("Colunas disponíveis em Age_Marcacao:");
            //       result.recordset.forEach((row) => console
            //           .log(" •", row.COLUMN_NAME));
            //     })
            //     .catch((err) => console.error(err));

            console.log("Entrou Try");
            sqlConnection.connect(sqlConfig).then((pool) => {
              let sql = "";
              sql = "SELECT ConfirmacaoEmail ";
              sql = sql + "FROM dbo.Age_Marcacao ";
              sql = sql + "WHERE IDMarcacao = " + IDMarcacao;
              return pool.query(sql);
            }).then((result) => {
              console.log("Entrou no then result");
              const obsOld = result.recordset[0].Observacao;
              let sql2 = "";
              if (obsOld) {
                sql2 = "UPDATE dbo.Age_Marcacao ";
                sql2 = sql2 + "SET ConfirmacaoEmail = '" + obsOld;
                sql2 = sql2 + ". " + novaObs + ".' ";
                sql2 = sql2 + "WHERE IDMarcacao = " + IDMarcacao;
              } else {
                sql2 = "UPDATE dbo.Age_Marcacao ";
                sql2 = sql2 + "SET ConfirmacaoEmail = '" + novaObs + ".' ";
                sql2 = sql2 + "WHERE IDMarcacao = " + IDMarcacao;
              }
              const ReqASA = new sqlConnection.Request();
              ReqASA.query(sql2);
            });
          } catch (err) {
            // ... error checks
            console.log("Erro try: " + JSON.stringify(err));
          }
          console.log(novaObs);
        }
        //
        let idTelClinica = "";
        let telPaciente = "";

        console.log("from: " + from);
        console.log("phoneNumberId: " + phoneNumberId);

        if (ambiente == "teste") {
          // idTelClinica = "691264807409202"; // Tel teste WA
          idTelClinica = "779376061914800"; // Tel teste oft
          telPaciente = "5521971938840"; // gabriel
        } else {
          idTelClinica = phoneNumberId; // OFT
          telPaciente = from; // telefone do paciente
        }
        const parametros = {
          phoneNumberId: idTelClinica,
          accessToken: VERIFY_TOKEN,
        };

        let arrMessage = [];
        if (modelo === "false") {
        // Envio dos botões “SEM modelo pré‑aprovado”
        // envio de texto simples sem botão
          arrMessage = [{
            phone: telPaciente,
            text: message1,
          }];
        } else if (modelo === "true" && novaObs === "CONFIRMADO") {
          // resposta dos botões “COM modelo pré‑aprovado”
          // envio de texto simples sem botão
          arrMessage = [{
            phone: telPaciente,
            template: {
              namespace: nameSpace,
              name: nomeModeloRespBotConfirmar,
              language: {policy: "deterministic", code: "pt_BR"},
              components: [
                {
                  type: "body",
                  parameters: [
                    {type: "text", parameter_name: "paciente",
                      text: paciente,
                    },
                  ],
                },
              ],
            },
          }];
        } else if (modelo === "true" && novaObs === "CANCELADO") {
          // resposta dos botões “COM modelo pré‑aprovado”
          // envio de texto simples sem botão
          arrMessage = [{
            phone: telPaciente,
            template: {
              namespace: nameSpace,
              name: nomeModeloRespBotCancelar,
              language: {policy: "deterministic", code: "pt_BR"},
              components: [
                {
                  type: "body",
                  parameters: [
                    {type: "text", parameter_name: "paciente",
                      text: paciente,
                    },
                  ],
                },
              ],
            },
          }];
        }

        // envia via WA API
        callWaApi(arrMessage, parametros, 0);
      } else {
        console.log("Campos obrigatórios ausentes - nada foi respondido.");
      }
      resp.sendStatus(200);
    });

// CAMPANHA GERAL PAM
let pamNomeCampanha = "ultraformer";

exports.pamCampanhaUltraformerCriarNo = functions.https.
    onRequest((req, resp) => {
      console.log("Entrou no criar nó");
      const db = admin.database();
      db.ref("PAM/campanha/"+ pamNomeCampanha +"/aEnviarOnWrite").set(true);
      db.ref("PAM/campanha/"+ pamNomeCampanha +"/pacientesCompleto/").set(true);
      db.ref("PAM/campanha/"+ pamNomeCampanha +"/enviados/").set(true);
      db.ref("PAM/campanha/"+ pamNomeCampanha +
          "/configuracoes/quantidadeEnvio/").set(1);
      db.ref("PAM/_dadosComuns/cancelados").set(true);
      resp.end("Ok\n"+resp.status.toString());
    });


// exports.pamCampanhaUltraformerJson = functions.runWith({timeoutSeconds: 540})
//     .https.onRequest((req, resp) => {
exports.pamCampanhaUltraformerJson = functions.pubsub
    .schedule("00 16 * * 1-5")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou no pamCampanhaUltraformerJson");

      const promises = [];
      let monthEnvio;
      let dayEnvio;
      let dataEnvio;
      let yearEnvio;
      let sendDate;
      const today = new Date();
      const todayDate = today.getDate()+"/"+(today.getMonth()+1)+"/"+
      today.getFullYear();
      const db = admin.database();
      db.ref("PAM/campanha/"+ pamNomeCampanha +"/aEnviarOnWrite").set(true);

      try {
        return sqlConnection.connect(sqlConfig).then((pool) => {
          console.log("Entrou connect");
          promises.push(db.ref("PAM/campanha/"+ pamNomeCampanha +
            "/pacientesCompleto/").once("value"));
          promises.push(db.ref("PAM/campanha/"+ pamNomeCampanha +
            "/enviados/").once("value"));
          promises.push(db.ref("PAM/campanha/"+ pamNomeCampanha +
              "/configuracoes/quantidadeEnvio/").once("value"));
          promises.push(db.ref("PAM/_dadosComuns/cancelados/").once("value"));
          return Promise.all(promises).then((res) => {
            console.log("Entrou Promise");
            // Armazenamento leitura dos DB
            // const agendados = res[0].recordsets[0];
            // const ultimoAno = res[0].recordsets[1];
            const aEnviar = res[0].val();
            const enviados = res[1].val();
            const quantidadeEnvio = res[2].val();
            const cancelados = res[3].val();

            // Processamento dos Enviados
            // Remoção de pacientes enviados há mais de 1 mês
            const entriesEnviados = Object.entries(enviados);
            const entriesAEnviar = Object.entries(aEnviar);
            const entriesCancelados = Object.entries(cancelados);
            const enviadosFiltrado = {};
            let countEnviadosFiltrado = 0;
            // Cancelados
            console.log("Cancelados: "+JSON.stringify(entriesCancelados));
            // Retirar enviados há mais de um mês
            entriesEnviados.forEach((element) => {
              dataEnvio = element[1].DataEnvio;
              dayEnvio = dataEnvio.split("/")[0];
              monthEnvio = dataEnvio.split("/")[1];
              yearEnvio = dataEnvio.split("/")[2];
              sendDate = new Date(monthEnvio+"/"+
                dayEnvio+"/"+yearEnvio);
              sendDate.setDate(sendDate.getDate()+15);
              if (sendDate>today) {
                countEnviadosFiltrado+=1;
                // console.log("0-:>" + element[0]);
                // console.log("1-:>" + JSON.stringify(element[1]));
                // console.log("element-:>" + JSON.stringify(element));

                enviadosFiltrado[element[0]] = element[1];
              }
            });
            console.log("Passou For Each Enviados");

            // Filtrando a Enviar
            const entriesEnviadosFiltrados = Object.entries(enviadosFiltrado);
            let count = 0;
            let countLidos = 0;
            // const countAgendados = 0;
            // const countUltimoAno = 0;
            let countEnviados = 0;
            let countCancelados = 0;

            const dataAtualAux = new Date();
            const dataAtual = JSON.stringify(dataAtualAux);
            // Lê entriesAEnviar do fim pro inicio
            entriesAEnviar.slice().forEach((pacAEnviar)=>{
              countLidos+=1;
              if (count<quantidadeEnvio) {
                // // agendados
                // if (agendados.some((pacAgendado) =>
                //   pacAgendado.CodPaciente==pacAEnviar[1].CodPaciente)) {
                //   // countAgendados+=1;
                //   // console.log("agendado " + pacAEnviar[1].Paciente);

                // // ultimo ano
                // } else if (ultimoAno.some((pacUltimoAno) =>
                //   pacUltimoAno.CodPaciente==pacAEnviar[1].CodPaciente)) {
                //   // countUltimoAno+=1;
                //   // console.log("ultimo ano " + pacAEnviar[1].Paciente); */

                // enviados
                if (entriesEnviadosFiltrados.some((pacEnviado) =>
                  pacEnviado[1].Telefone==pacAEnviar[1].Telefone)) {
                  countEnviados+=1;
                  // console.log("pacAEnviar-:>" + JSON.stringify(pacAEnviar));
                  // console.log("ja enviado " + pacAEnviar[1].Paciente);

                // cancelados
                } else {
                  let cancelou = false;
                  pacAEnviar[1].Telefone = JSON.
                      stringify(pacAEnviar[1].Telefone);
                  // console.log("pacAEnviar[1].Telefone " +
                  //     pacAEnviar[1].Telefone);
                  const whatsApp = tel2Whats(pacAEnviar[1].Telefone)
                      .substring(2, 13);
                  // console.log("whatsapp " + whatsApp);
                  if (cancelados[whatsApp]) {
                    const pacCanc = cancelados[whatsApp];
                    // console.log("pacCanc " + pacCanc);
                    if ((pacCanc.Reenviar.toString() == "") ||
                      (JSON.stringify(pacCanc.Reenviar) > dataAtual)) {
                      cancelou = true;
                    } else {
                      db.ref("PAM/_dadosComuns/cancelados/" +
                      whatsApp).set(null);
                    }
                  }
                  if (cancelou) {
                    countCancelados+=1;

                  // enviar
                  } else {
                    // console.log("enviou " + pacAEnviar[1].Paciente);
                    db.ref("PAM/campanha/"+ pamNomeCampanha +"/aEnviarOnWrite").
                        push(pacAEnviar[1]);
                    pacAEnviar[1].DataEnvio = todayDate;
                    enviadosFiltrado[pacAEnviar[0]] = pacAEnviar[1];
                    count+=1;
                  }
                }
              }
            });
            console.log("Cancelados: " + countCancelados);
            console.log("Ja enviados no ultimo mes: " + countEnviados);
            // console.log("Ultimo Ano: " + countUltimoAno);
            // console.log("Agendados: " + countAgendados);
            console.log("Enviados Filtrado: " + countEnviadosFiltrado);
            console.log("Lidos: " + countLidos);
            console.log("Enviados com sucesso: " + count);

            // não salvar no nó
            // if (ambiente === "producao") {
            db.ref("PAM/campanha/"+ pamNomeCampanha +"/enviados")
                .set(enviadosFiltrado);
            // }

            // resp.end("Ok"+resp.status.toString());
            return null;
          });
        });
      } catch (err) {
        // ... error checks
        console.log("Erro try: " + JSON.stringify(err));
      }
    });


exports.pamCampanhaUltraformerZApi =
    functions.database.ref("PAM/campanha/"+ pamNomeCampanha +
        "/aEnviarOnWrite/{pushId}")
        .onWrite((change, context) => {
          // Only edit data when it is first created.
          // if (change.before.exists()) {
          // return null;
          // }
          // Exit when the data is deleted.
          if (!change.after.exists()) {
            return null;
          }
          // const db = admin.database();
          // Grab the current value of what was written to the RT Database
          const element = change.after.val();
          console.log(JSON.stringify(element));
          let paciente = "";
          if (element.Paciente) {
            paciente = element.Paciente;
          }
          let whatsAppCel;
          if (element.Telefone) {
            whatsAppCel = tel2Whats(element.Telefone);
          }
          // let dataNascimento;
          // if (element.Nascimento) {
          //   dataNascimento = element.Nascimento;
          // }
          // const message1Aux = whatsAppCel;

          if (ambiente == "teste") whatsAppCel = "5521971938840"; // gabriel

          if (whatsAppCel) {
            let parametros = {};
            if (ambiente == "teste") {
              parametros = {
                // TESTE = PRODUÇÂO
                // whatsAppCel: whatsAppCel,
                id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                token: "A8F754F1402CAE3625D5D578",
                // buttonList: buttonList,
              };
            } else {
              // TESTE = PRODUÇÂO
              parametros = {
                // whatsAppCel: whatsAppCel,
                id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                token: "A8F754F1402CAE3625D5D578",
                // buttonList: buttonList,
              };
            }

            // CAMPANHA ULTRAFORMER

            // COMO ACHAR EMOJI NO NODE
            // console.log(emoji.find("⏳"));
            // console.log(emoji.find("➡️"));

            // const emojiUse1 = emoji.get("hourglass_flowing_sand"); // ⏳
            // const emojiUse2 = emoji.get("arrow_right"); // ➡️


            // const message1 = "*Está achando o seu olhar cansado, " +
            // "envelhecido e com flacidez de pálpebras?*" +
            // "\n\nOlá " + paciente + "!" + " Tudo bem?" +
            // "\n\nNão perca o *Ultraformer Day* na Plástica a Mais!" +
            // "\nAproveite os valores incríveis para o tratamento de " +
            // "Ultraformer com a tecnologia MPT, que vai deixar sua " +
            // "pele ainda mais radiante. Bioestimula colágeno, " +
            // "promove efeito lifting e resultados visíveis." +
            // "\n\n" + emojiUse1 + " Vagas limitadas!" +
            // "\n\nPara participar basta responder *EU QUERO*" +
            // "\n\nPara não receber mais nossas mensagens basta responder " +
            // "*CANCELAR*";

            // const urlVideo ="https://firebasestorage.googleapis.com" +
            // "/v0/b/oftautomacao-9b427.appspot.com/o/" +
            // "CirurgiaPlastica%2FVideo2024-06-24.mp4?alt=media&" +
            // "token=fb9f600f-b623-4ab2-ad15-d93889c3dc72";

            // metodo antigo
            // const arrUrls = [urlVideo, message1];
            // const arrMessageType = ["video", "text"];

            const message1 = "*O QUE FALTA PARA VOCÊ INVESTIR NA SUA BELEZA?*" +
            "\n\nOlá " + paciente + ", tudo bem?" +
            "\n\nNão sei se acontece contigo mas muitas vezes nos deixamos " +
            "envolver no dia a dia e esquecemos de cuidar de nós. " +
            "E quando finalmente tiramos um tempo pra pensar nisso, " +
            "ainda assim relutamos devido aos custos." +
            "\n\nPensando nisso a Plastica A+ criou o projeto Beleza " +
            "Agora. Nesse projeto você pode conversar *GRATUITAMENTE* " +
            "com nossa consultora e planejar seus tratamentos estéticos " +
            "dentro do seu orçamento e do seu tempo disponível!" +
            "\n\nEntre os serviços oferecidos, destacamos: " +
            "\n- aplicação de toxina botulínica," +
            "\n- laserterapia," +
            "\n- peeling superficial, médio e profundo," +
            "\n- migroagulhamento," +
            "\n- microagulhamento com infusão de ativos," +
            "\n- preenchimento labial," +
            "\n- cirurgia plástica." +
            "\n\nVamos agendar uma conversa gratuita e montar um " +
            "planejamento personalizado?" +
            "\n\nPara não receber mais nossas mensagens basta responder " +
            "*CANCELAR*";

            // método novo com video
            // const arrMessage = [{
            //   "phone": whatsAppCel,
            //   "video": urlVideo,
            //   "caption": message1,
            // }];

            // método novo sem video, apenas texto
            const arrMessage = [{
              "phone": whatsAppCel,
              "message": message1,
            }];

            const i = 0;
            callZapiV3(arrMessage, parametros, i);
          }

          // return null;
        });
pamNomeCampanha = "faltosos";

exports.pamCampanhaFaltososJson = functions.https
    .onRequest((req, resp) => {
      // exports.pamPacientesFaltosJson = functions.pubsub
      //     .schedule("00 16 * * 1-5")
      //     .timeZone("America/Sao_Paulo") // Users can choose timezone
      //     .onRun((context) => {
      console.log("Entrou no pamCampanhaFaltososJson");

      const promises = [];
      const db = admin.database();
      db.ref("PAM/campanha/"+ pamNomeCampanha +"/aEnviarOnWrite").set(true);

      try {
        return sqlConnection.connect(sqlConfig).then((pool) => {
          console.log("Entrou connect");
          promises.push(db.ref("PAM/campanha/"+ pamNomeCampanha +
            "/pacientesCompleto/").once("value"));
          promises.push(db.ref("PAM/_dadosComuns/cancelados/").once("value"));
          return Promise.all(promises).then((res) => {
            console.log("Entrou Promise");
            const aEnviar = res[0].val();
            const cancelados = res[1].val();
            const entriesAEnviar = Object.entries(aEnviar);

            console.log("Passou For Each Enviados");

            let count = 0;
            let countLidos = 0;
            let countCancelados = 0;

            const dataAtualAux = new Date();
            const dataAtual = JSON.stringify(dataAtualAux);
            // Lê entriesAEnviar do fim pro inicio
            entriesAEnviar.slice().forEach((pacAEnviar)=>{
              countLidos+=1;

              // cancelados
              let cancelou = false;
              pacAEnviar[1].Telefone = JSON.
                  stringify(pacAEnviar[1].Telefone);
              // console.log("pacAEnviar[1].Telefone " +
              //     pacAEnviar[1].Telefone);
              const whatsApp = tel2Whats(pacAEnviar[1].Telefone)
                  .substring(2, 13);
              // console.log("whatsapp " + whatsApp);
              if (cancelados[whatsApp]) {
                const pacCanc = cancelados[whatsApp];
                // console.log("pacCanc " + pacCanc);
                if ((pacCanc.Reenviar.toString() == "") ||
                  (JSON.stringify(pacCanc.Reenviar) > dataAtual)) {
                  cancelou = true;
                } else {
                  db.ref("PAM/_dadosComuns/cancelados/" +
                  whatsApp).set(null);
                }
              }
              if (cancelou) {
                countCancelados+=1;

              // enviar
              } else {
                // console.log("enviou " + pacAEnviar[1].Paciente);
                db.ref("PAM/campanha/"+ pamNomeCampanha +
                      "/aEnviarOnWrite").push(pacAEnviar[1]);
                count+=1;
              }
            });
            console.log("Cancelados: " + countCancelados);
            console.log("Lidos: " + countLidos);
            console.log("Enviados com sucesso: " + count);

            resp.end("Ok"+resp.status.toString());
            // return null;
          });
        });
      } catch (err) {
        // ... error checks
        console.log("Erro try: " + JSON.stringify(err));
      }
    });


exports.pamCampanhaFaltososZApi =
  functions.database.ref("PAM/campanha/"+ pamNomeCampanha +
      "/aEnviarOnWrite/{pushId}")
      .onWrite((change, context) => {
        if (!change.after.exists()) {
          return null;
        }
        const element = change.after.val();
        console.log(JSON.stringify(element));
        let paciente = "";
        if (element.Paciente) {
          paciente = element.Paciente;
        }
        let dataMarcada = "";
        if (element.data) {
          dataMarcada = element.data;
        }
        let HorarioMarcado = "";
        if (element.horario) {
          HorarioMarcado = element.horario;
        }
        let whatsAppCel;
        if (element.Telefone) {
          whatsAppCel = tel2Whats(element.Telefone);
        }
        const whatsAppCelTeste = whatsAppCel;
        if (ambiente == "teste") whatsAppCel = "5521971938840"; // gabriel

        if (whatsAppCel) {
          let parametros = {};
          if (ambiente == "teste") {
            parametros = {
              id: "3B74CE9AFF0D20904A9E9E548CC778EF",
              token: "A8F754F1402CAE3625D5D578",
            };
          } else {
            parametros = {
              id: "3D460A6CB6DA10A09FAD12D00F179132",
              token: "1D2897F0A38EEEC81D2F66EE",
            };
          }

          let message1 = "Olá! Aqui é do Plástica A Mais." +
              "\n\nNa data " + dataMarcada + ", o(a) paciente " + paciente +
              " tinha uma consulta agendada às " + HorarioMarcado + "." +
              "\n\nVimos que não pôde comparecer. " +
              "Gostaria de reagendar uma nova consulta?";

          if (ambiente == "teste") {
            message1 = message1 + "\n\n" + whatsAppCelTeste;
          }

          const arrMessage = [{
            "phone": whatsAppCel,
            "message": message1,
          }];

          const i = 0;
          callZapiV3(arrMessage, parametros, i);
        }
      });


//  TESTEmsgR INI
exports.rdhMensagemRecebidaZApiWH = functions.https.
    onRequest((req, resp) => {
      cors(req, resp, () => {
        sqlConfig = {
          user: functions.config().sqlserver.usuario,
          password: functions.config().sqlserver.senha,
          database: "ASADB",
          server: "oftalclinsrv.no-ip.org",
          pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 3000000,
          },
          options: {
            encrypt: true, // for azure
            trustServerCertificate: true,
            // change to true for local dev / self-signed certs
          },
        };
        let sendMsg = "";
        // let buttonList = "";
        // let postData = "";
        let optionList = {};
        let dadosCancelar = {};
        let receivedID = "";
        const db = admin.database();

        // LIST
        // console.log("list ID -> " + JSON.stringify(req.body
        //     .listResponseMessage.selectedRowId));
        if (req.body.listResponseMessage) {
          if (req.body.listResponseMessage.selectedRowId) {
            receivedID = req.body.listResponseMessage.selectedRowId;
          }
        } else {
          console.log("finalizou no else req.body.listResponseMessage!");
          resp.status(200).end();
        }

        const whatsAppCel = req.body.phone.substring(2, 13);
        // const IDMarcacao = receivedID.split(/-/g)[1];

        // chave ID
        console.log("\nchave ID -> "+ receivedID + "\n");

        // Antes e Depois RDH
        if (receivedID.match(/ANTESDEPOIS/g)) {
          if (receivedID.match(/ANTESDEPOIS-BOM/g)) {
            console.log("Entrou if ANTESDEPOIS-BOM");
            sendMsg = "Que bom! Ficamos muito felizes!" +
            "\n\nPara que possamos inspirar outras " +
            "pessoas a realizar o sonho da cirurgia " +
            "plástica, convidamos você a participar do " +
            "nosso projeto _'Antes e Depois'_." +
            "\n\nEnvie-nos uma foto do antes e outra do " +
            "depois da sua cirurgia plástica e, com sua " +
            "autorização, compartilharemos sua incrível " +
            "transformação nas nossas redes sociais." +
            "\n\nSua história pode ser a motivação que alguém " +
            "precisa para dar o próximo passo." +
            "\n\nVocê gostaria de participar?";

            optionList = {
              // "title": "Opções disponíveis",
              "buttonLabel": "Clique aqui para responder",
              "options": [
                {
                  "id": "ANTESDEPOISBOM-SIM",
                  "title": "Sim, gostaria de participar",
                  // "description": "Z-API Asas para sua imaginação",
                },
                {
                  "id": "ANTESDEPOISBOM-NAO",
                  "title": "Não gostaria de participar",
                  // "description": "Não funcionam",
                },
                {
                  "id": "ANTESDEPOISBOM-FLRATENDENTE",
                  "title": "Falar com um atendente",
                  // "description": "Não funcionam",
                },
              ],
            };
          }
          if (receivedID.match(/ANTESDEPOISBOM-FLRATENDENTE/g)) {
            console.log("Entrou if ANTESDEPOISBOM-NAOTEMFT");
            sendMsg = "Sem problemas, uma atendente " +
            "entrará em contato com você em breve!";
          }
          if (receivedID.match(/ANTESDEPOISBOM-NAO/g)) {
            console.log("Entrou if ANTESDEPOIS-BOM-NAO");
            sendMsg = "Sem problema, Agradecemos seu feedback!";
          }
          if (receivedID.match(/ANTESDEPOISBOM-SIM/g)) {
            console.log("Entrou if ANTESDEPOISBOM-SIM");
            sendMsg = "Ótimo! Ficamos muito felizes com sua participação. " +
            "Confirme o termo de Autorização de Imagem abaixo:" +
            "\n\nAutorizo o Rio Day Hospital " +
            "a utilizar minhas fotos para fins de divulgação " +
            "em suas redes sociais do Facebook e " +
            "Instagram. Estou ciente " +
            "de que esta autorização é válida por tempo " +
            "indeterminado e que posso revogá-la a qualquer " +
            "momento mediante solicitação. " +
            "Confirmo que estou ciente e de acordo " +
            "com os termos acima.";

            optionList = {
              // "title": "Opções disponíveis",
              "buttonLabel": "Clique aqui para responder",
              "options": [
                {
                  "id": "ANTESDEPOISBOMSIM-CONF",
                  "title": "Sim, Autorizo a utilização de minhas imagens",
                  // "description": "Z-API Asas para sua imaginação",
                },
                {
                  "id": "ANTESDEPOISBOMNAO-NCONF",
                  "title": "Não autorizo a utilizazação de minhas imagens",
                  // "description": "Não funcionam",
                },
              ],
            };
          }

          if (receivedID.match(/ANTESDEPOISBOMSIM-CONF/g)) {
            console.log("Entrou if ANTESDEPOISBOMSIM-CONF");
            sendMsg = "Obrigado! Estamos aguardando o " +
            "envio das suas fotos. Sua contribuição " +
            "é muito valiosa para nós e ajudará a " +
            "inspirar outros pacientes.";
          }
          if (receivedID.match(/ANTESDEPOISBOMNAO-NCONF/g)) {
            console.log("Entrou if ANTESDEPOISBOMNAO-NCONF");
            sendMsg = "Tudo bem. Agradecemos seu feedback " +
            "e respeitamos sua decisão. Se mudar de " +
            "ideia no futuro, estaremos aqui para você.";
          }
          if (receivedID.match(/ANTESDEPOIS-REGULAR/g)) {
            console.log("Entrou if ANTESDEPOIS-REGULAR");
            sendMsg = "Agradecemos seu feedback. " +
            "Poderia nos dizer o que não gostou " +
            "ou o que poderia ser melhorado?";
          }
          if (receivedID.match(/ANTESDEPOIS-RUIM/g)) {
            console.log("Entrou if ANTESDEPOIS-RUIM");
            sendMsg = "Lamentamos saber que sua " +
            "experiência não foi satisfatória. " +
            "Poderia nos explicar o que não " +
            "gostou ou o que poderia ser melhorado?";

            dadosCancelar = {
              Reenviar: "",
            };
            db.ref("OFT/45/_dadosComuns/cancelados/automatico/" +
                whatsAppCel).set(dadosCancelar);
          }
        } else {
          resp.end();
          return;
        }
        console.log("Vai entrar no if sendMsg: " + sendMsg);
        if (sendMsg) {
          if (whatsAppCel) {
            console.log("Entrou no if whatsAppCel");
            let parametros = {};
            if (ambiente == "teste") {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                token: "A8F754F1402CAE3625D5D578",
                optionList: optionList,
              };
            } else {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "39C7A89881E470CC246252059E828D91",
                token: "B1CA83DE10E84496AECE8028",
                optionList: optionList,
              };
            }
            // método antigo
            // const arrUrls = [sendMsg];
            // const arrMessageType = ["text"];

            // método novo sem video, apenas texto
            const arrMessage = [{
              "phone": whatsAppCel,
              "message": sendMsg,
            }];

            const i = 0;
            // callZapiV3(arrUrls, arrMessageType, parametros, i);
            callZapiV3(arrMessage, parametros, i);
          }
        }
        console.log("finalizou!");
        resp.status(200).end();
      });
    });
//  TESTEmsgR FIN

exports.rdhAntesDepoisJsonCriarNo = functions.https.
    onRequest((req, resp) => {
      console.log("Entrou no criar nó - rdhAntesDepoisJsonCriarNo");
      const db = admin.database();
      db.ref("RDH/antesDepois/medicos").set(true);
      resp.end("Ok\n"+resp.status.toString());
    });


// exports.rdhAntesDepoisJson = functions.runWith({timeoutSeconds: 540}).https
//     .onRequest((req, resp) => {
//       // exports.rdhAntesDepoisJson = functions.pubsub
//       //     .schedule("36 17 * * 1-5")
//       //     .timeZone("America/Sao_Paulo") // Users can choose timezone
//       //     .onRun((context) => {
//       console.log("Entrou Função rdhAntesDepoisJson");

//       const today = new Date();
//       const year = today.getFullYear();
//       const mm = today.getMonth()+1;
//       const dd = today.getDate();

//       const newDate = new Date(today);
//       newDate.setMonth(today.getMonth() - 3);

//       try {
//         return sqlConnection.connect(sqlConfig).then((pool) => {
//           // pool.sqlConnection.connect(sqlConfig);
//           // console.log("Entrou connect");
//           let sql = "";
//           if (ambiente == "teste") {
//             sql = "SELECT * ";
//             sql = sql +
//  "FROM   dbo.vw_GSht_Age_MarcacaoCirurgia_Confirmacao ";
//             sql = sql + "WHERE  IDEmpresa = 102 ";
//             sql = sql + "AND  DataMarcada >= '2025-01-25' ";
//             sql = sql + "AND  DataMarcada < '2025-01-26' ";
//             sql = sql + "ORDER BY DataMarcada";
//           } else {
//             // busca Ativa RDH
//             // sql = sql + "SELECT * FROM dbo.vw_Excel_Sis_Atendimento";
//             // sql = sql + "_Busca_Ativa_RDH";

//             // pacientes atendidos cirurgicos
//             sql = "SELECT * ";
//             sql = sql +
//  "FROM   dbo.vw_GSht_Age_MarcacaoCirurgia_Confirmacao ";
//             sql = sql + "WHERE  IDEmpresa = 102 ";
//             sql = sql + "AND  DataMarcada < DATEADD(dd," + 0 + ",";
//             sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//             sql = sql + ",0,0,0,0)) ";
//             sql = sql + "AND  DataMarcada >= DATEADD(dd," + -1 + ",";
//             sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
//             sql = sql + ",0,0,0,0)) ";
//             sql = sql + "ORDER BY DataMarcada";
//           }

//           return pool.query(sql);
//           // const result = pool.query(sql);
//         }).then((result) => {
//           const db = admin.database();
//           const refAEnviar = db.ref("RDH/antesDepois/aEnviar");
//           refAEnviar.set(null);

//           const ref = db.ref("RDH/antesDepois/aEnviar");
//           result.recordset.forEach((element) => {
//             const year = element.DataMarcada.getFullYear();
//             const mm = element.DataMarcada.getMonth()+1;
//             const dd = element.DataMarcada.getDate();
//             const hh = element.DataMarcada.getHours();
//             let min = element.DataMarcada.getMinutes();
//             if (min == 0 ) {
//               min = "00";
//             }
//             const dataMarcada = dd + "/" + mm + "/" +
//               year + "  " + hh + ":" + min;
//             element.DataMarcada = dataMarcada;
//             const refMedico = db.ref("RDH/antesDepois/medicos/" +
//                element.IDCirurgiao);
//             refMedico.once("value").then((snapshot) => {
//               if (snapshot.val()) {
//                 ref.push(element);
//               }
//             });
//           });
//           resp.end("Ok"+resp.status.toString());
//           // ref.set(true);
//           // return null;
//         });
//       } catch (err) {
//         // ... error checks
//         console.log("Erro try: " + JSON.stringify(err));
//       }
//     });


exports.rdhAntesDepoisZApi =
    functions.database.ref("RDH/antesDepois/aEnviar/{pushId}")
        .onWrite((change, context) => {
          console.log("Entrou rdhAntesDepoisZApi");
          if (!change.after.exists()) {
            return null;
          }
          const element = change.after.val();
          console.log(JSON.stringify(element));

          let paciente = "";
          if (element.Paciente) {
            paciente = element.Paciente;
          }
          let whatsAppCel;
          if (element.phone) {
            whatsAppCel = tel2Whats(element.Telefone);
          }
          let dataAtendimento = "";
          // if (element.DataAtendimento) {
          if (element.DataMarcada) {
            // dataAtendimento = element.DataAtendimento;
            dataAtendimento = element.DataMarcada;
            // dataAtendimento = dataAtendimento.split("T")[0];
            // const dia = dataAtendimento.split("-")[2];
            // const mes = dataAtendimento.split("-")[1];
            // const ano = dataAtendimento.split("-")[0];
            // dataAtendimento = dia +"/"+ mes +"/"+ ano;
          }
          let medico = "";
          if (element.Medico) {
            medico = element.Medico;
          }
          // let IDMarcacao = "";
          // if (element.IDMarcacao) {
          //   IDMarcacao = element.IDMarcacao;
          // }

          // const message1Aux = whatsAppCel;
          if (ambiente == "teste") whatsAppCel = "5521971938840";

          const emojiUse1 = emoji.get("grin"); // 😁
          const emojiUse2 = emoji.get("neutral_face"); // 😐
          const emojiUse3 = emoji.get("slightly_frowning_face"); // 🙁


          // #OptionList
          const optionList = {
            // "title": "Opções disponíveis",
            "buttonLabel": "Clique aqui para responder",
            "options": [
              {
                "id": "ANTESDEPOIS-BOM",
                "title": emojiUse1 + " Muito Bom",
                "description": "Gostei muito do resultado da cirurgia",
              },
              {
                "id": "ANTESDEPOIS-REGULAR",
                "title": emojiUse2 + " Regular",
                "description": "Gostei parcialmente do resultado da cirurgia",
              },
              {
                "id": "ANTESDEPOIS-RUIM",
                "title": emojiUse3 + " Ruim",
                "description": "Não gostei do resultado da cirurgia",
              },
            ],
          };

          if (whatsAppCel) {
            let parametros = {};
            if (ambiente == "teste") {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                token: "A8F754F1402CAE3625D5D578",
                optionList: optionList,
              };
            } else {
              parametros = {
                // whatsAppCel: whatsAppCel,
                id: "39C7A89881E470CC246252059E828D91",
                token: "B1CA83DE10E84496AECE8028",
                optionList: optionList,
              };
            }
            const message1 = "Olá " + paciente + "!" +
            "\n\nAqui é do Rio Day Hospital. " +
            "Você realizou uma cirurgia conosco " +
            "no dia " + dataAtendimento.split(" ")[0] +
            " com o Dr. " + medico + "." +
            "\n\nGostaríamos de saber como você está " +
            "se sentindo em relação aos resultados " +
            "da sua cirurgia. " +
            "Poderia compartilhar sua opinião conosco?";

            // if (ambiente === "teste") {
            //   message1 = message1Aux + " > " + paciente +
            //   " -> " + message1;
            // }

            // método antigo
            // const arrUrls = [message1];
            // const arrMessageType = ["text"];

            // método novo sem video, apenas texto
            const arrMessage = [{
              "phone": whatsAppCel,
              "message": message1,
            }];

            const i = 0;
            callZapiV3(arrMessage, parametros, i);
          }
          return null;
        });

exports.rdhAvisoAumentoPrecoJson = functions.https.
    onRequest((req, resp) => {
      // exports.rdhAvisoAumentoPrecoJson = functions.pubsub
      //     .schedule("00 07 * * *")
      //     .timeZone("America/Sao_Paulo") // Users can choose timezone
      //     .onRun((context) => {
      console.log("Entrou Função rdhAvisoAumentoPrecoJson");
      const today = new Date();
      // const year = today.getFullYear();
      // const mm = today.getMonth()+1;
      // const dd = today.getDate();
      const diaDaSemana = today.getDay();
      if (diaDaSemana != 0 && diaDaSemana != 6 ) {
        try {
          // make sure that any items are correctly
          // URL encoded in the connection string
          // console.log("Entrou try");
          return sqlConnection.connect(sqlConfig).then((pool) => {
            // pool.sqlConnection.connect(sqlConfig);
            // console.log("Entrou connect");
            let sql = "";
            if (ambiente == "teste") {
              sql = "SELECT * ";
              sql = sql + "FROM   ";
              sql = sql + "dbo.vw_GSht_Age_MarcacaoCirurgia_Confirmacao ";
              sql = sql + "WHERE  DataMarcada >= '2025-01-25' ";
              sql = sql + "AND  DataMarcada < '2025-01-26' ";
              sql = sql + "AND    IDEmpresa = 102 "; // 101 para Usina
              sql = sql + "ORDER BY DataMarcada";
            } else {
              sql = "SELECT * ";
              sql = sql + "FROM   ";
              sql = sql + "dbo.vw_GSht_Age_MarcacaoCirurgia_Confirmacao ";
              sql = sql + "WHERE  DataMarcada >= '2024-08-01' ";
              sql = sql + "AND    IDEmpresa = 102 "; // 101 para Usina
              sql = sql + "ORDER BY DataMarcada";
            }

            return pool.query(sql);
            // const result = pool.query(sql);
          }).then((result) => {
            const db = admin.database();

            const refAEnviar = db.ref("RDH/avisoAumentoPreco/aEnviar");
            refAEnviar.set(null);

            const ref = db.ref("RDH/avisoAumentoPreco/aEnviar");
            result.recordset.forEach((element) => {
              /*
              const year = element.DataMarcada.substring(0, 3);
              const mm = element.DataMarcada.substring(5, 6);
              const dd = element.DataMarcada.substring(8, 9);
              const hh = element.DataMarcada.substring(11, 12);
              const min = element.DataMarcada.substring(14, 15);
              */
              const year = element.DataMarcada.getFullYear();
              const mm = element.DataMarcada.getMonth()+1;
              const dd = element.DataMarcada.getDate();
              const hh = element.DataMarcada.getHours();
              let min = element.DataMarcada.getMinutes();
              if (min == 0 ) {
                min = "00";
              }
              const dataMarcada = dd + "/" + mm + "/" +
                year + "  " + hh + ":" + min;
              element.DataMarcada = dataMarcada;
              ref.push(element);
            });
            resp.end("Ok"+resp.status.toString());
            // ref.set(true);
            // return null;
          });
        } catch (err) {
          // ... error checks
          console.log("Erro try: " + JSON.stringify(err));
        }
      }
    });

exports.rdhAvisoAumentoPrecoZApi =
  functions.database.ref("RDH/avisoAumentoPreco/aEnviar/{pushId}")
      .onWrite((change, context) => {
        // Only edit data when it is first created.
        // if (change.before.exists()) {
        // return null;
        // }
        // Exit when the data is deleted.
        if (!change.after.exists()) {
          return null;
        }
        // const db = admin.database();
        // const pushID = context.params.pushId;
        // const refAEnviar = db.ref("OFT/45/confirmacaoPacientes/aEnviar/" +
        //   pushID);
        // refAEnviar.set(null);

        // Grab the current value of what was written to the Realtime Database
        const element = change.after.val();
        console.log(JSON.stringify(element));
        // let endereco = "Praça Saenz Pena 45, sala 1508 - Tijuca";
        // console.log("forEach. element:" + JSON.stringify(element));
        let paciente = "";
        let dataMarcada = "";
        let medico = "";
        let convenio = "";
        let telCom = "";
        let telRes = "";
        let tel = "";
        let telCel = "";
        let message1 = "";
        // let IDMarcacao = "";
        if (element.Paciente) {
          paciente = element.Paciente;
        }
        if (element.DataMarcada) {
          dataMarcada = element.DataMarcada;
        }
        if (element.Medico) {
          medico = element.Medico;
        }
        if (element.Convenio) {
          convenio = element.Convenio;
        }

        // if (element.IDMarcacao) {
        //   IDMarcacao = element.IDMarcacao;
        // }
        if (convenio == "Particular Oft" ||
            convenio == "Partic Rdh Especial Ou Sabado" ||
            convenio == "Partic Rdh Econômico" ||
            convenio == "Partic Rdh Completo") {
          if (element.TelefoneCom) {
            telCom = element.TelefoneCom.replace("(", "");
            telCom = telCom.replace(")", "");
            telCom = telCom.replace(".", "");
            telCom = telCom.replace(" ", "");
            telCom = telCom.replace("-", "");
            telCom = telCom.replace("-", "");
            // console.log("element.TelefoneCom: " + element.TelefoneCom);
            // console.log("telCom: " + telCom);
          }
          if (element.TelefoneCel) {
            telCel = element.TelefoneCel.replace("(", "");
            telCel = telCel.replace(")", "");
            telCel = telCel.replace(".", "");
            telCel = telCel.replace(" ", "");
            telCel = telCel.replace("-", "");
            telCel = telCel.replace("-", "");
            // console.log("element.TelefoneCel: " + element.TelefoneCel);
            // console.log("telCel: " + telCel);
          }
          if (element.TelefoneRes) {
            telRes = element.TelefoneRes.replace("(", "");
            telRes = telRes.replace(")", "");
            telRes = telRes.replace(".", "");
            telRes = telRes.replace(" ", "");
            telRes = telRes.replace("-", "");
            telRes = telRes.replace("-", "");
            // console.log("element.TelefoneRes: " + element.TelefoneRes);
            // console.log("telRes: " + telRes);
          }
          if (element.Telefone) {
            tel = element.Telefone.replace("(", "");
            tel = tel.replace(")", "");
            tel = tel.replace(".", "");
            tel = tel.replace(" ", "");
            tel = tel.replace("-", "");
            tel = tel.replace("-", "");
            // console.log("element.Telefone: " + element.Telefone);
            // console.log("tel: " + tel);
          }

          let whatsAppCel = "";
          if (tel&&(tel.substring(2, 3) == "9")) {
            whatsAppCel = "55" + tel;
          } else if ((telCel)&&(telCel.substring(2, 3) == "9")) {
            whatsAppCel = "55" + telCel;
          } else if ((telRes)&&(telRes.substring(2, 3) == "9")) {
            whatsAppCel = "55" + telRes;
          } else if ((telCom)&&(telCom.substring(2, 3) == "9")) {
            whatsAppCel = "55" + telCom;
          }
          // const whatsAppCelPaciente = whatsAppCel;
          if (ambiente == "teste") whatsAppCel = "5521971938840";

          // console.log("whatsAppCel: " + whatsAppCel);
          if (whatsAppCel) {
            // if (convenio == "Particular Oft") convenio = "Particular";

            message1 = "Prezado(a) " + paciente + "," +
            "\n\nInformamos que, a partir de 1º de agosto de 2024, " +
            "haverá um reajuste nos valores das cirurgias " +
            "realizadas em nosso hospital. Caso queira manter o " +
            "preço atual, basta efetuar o pagamento até 31 de julho. " +
            "\n\nAgradecemos pela sua compreensão e continuamos à disposição " +
            "para atendê-lo(a) com a mesma qualidade de sempre." +
            "\n\nSua cirurgia está pré-agendada para o dia " +
            dataMarcada.split(" ")[0] + ", às " +
            dataMarcada.split(" ")[2] + ", e será realizada " +
            "pelo Dr(a). " + medico + "." +
            "\nEstamos à disposição para qualquer esclarecimento." +
            "\n\nAtenciosamente,\nRio Day Hospital";

            // message1 = "Olá! Aqui é da Oftalmo Day." +
            // "\n\nGostaríamos de confirmar o exame abaixo:" +
            // "\n*Paciente:* " + paciente +
            // "\n*Data/Hora:* " + dataMarcada +
            // "\n*Exame:* " + medico +
            // "\n*Plano:* " + convenio +
            // "\n*Endereço:* " + endereco +
            // "\n\n*CONFIRMA*?";
          }

          if (ambiente == "teste") whatsAppCel = "5521971938840"; // gabriel

          if (whatsAppCel) {
            let parametros = {};
            if (ambiente == "teste") {
              // ZApi teste ocupado com Plástica A+
              // parametros = {
              //   whatsAppCel: whatsAppCel,
              //   id: "3B74CE9AFF0D20904A9E9E548CC778EF",
              //   token: "A8F754F1402CAE3625D5D578",
              //   // optionList: optionList,
              // };

              // utilizar o ZApi RDH
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "3A86AB874F03509BE904C23DAB4C141D",
                token: "A1B7FC0CB9F9105A8975556F",
                // optionList: optionList,
              };
            } else {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "3A86AB874F03509BE904C23DAB4C141D",
                token: "A1B7FC0CB9F9105A8975556F",
                // optionList: optionList,
              };
            }
            const arrUrls = [message1];
            const arrMessageType = ["text"];
            const i = 0;
            callZapiV2(arrUrls, arrMessageType, parametros, i);
          }
        }
        return null;
        // else {
        //   const pushID = context.params.pushId;
        //   const refAEnviar = db
        // .ref("OFT/45/confirmacaoPacientes/aEnviar/" +
        //       pushID);
        //   refAEnviar.set(null);
        // }
      });


// /**
//  * Cancelados Automáticos (a ser feito) + Cancelados Planilha RDH.
// *@constructor
// *@param {JSON} testeQtdCancelados
//  */
// function rdhCanceladosAll(testeQtdCancelados) {
//   const promises = [];
//   const db = admin.database();
//   console.log("Entrou oft45CanceladosAll");

//   let sheetId = "";

//   sheetId = "1qzC1RBQ0X-rlKqg_N6-qnEpvx65FuES7ZUfF3ygIj8I";
//   // if (ambiente === "teste") {
//   //   sheetId = "1qzC1RBQ0X-rlKqg_N6-qnEpvx65FuES7ZUfF3ygIj8I";
//   // } else {
//   //   sheetId = "1jApb1NOrMYoLce8MKxkUSLBpwEXbe1N1b33di08Ww40";
//   // }
//   promises.push(db.ref("RDH/_dadosComuns/Cancelados/" + sheetId +
//       "/Cancelados").once("value"));

//   // promises.push(db.ref("RDH/_dadosComuns/Cancelados/automatico")
//   //     .once("value"));

//   return Promise.all(promises).then((res) => {
//     console.log("Entrou Promise rdhCalceladosAll");
//     const canceladosPlanilha = res[0].val();
//     // const canceladosAutomatico = res[1].val();
//     console.log("canceladosPlanilha:"+JSON.stringify(canceladosPlanilha));
//   //console.log("canceladosAutomatico"+JSON.stringify(canceladosAutomatico));
//     // const canceladosAll = Object
//     //     .assign(canceladosAutomatico, canceladosPlanilha);
//     const canceladosAll = Object.assign(canceladosPlanilha);
//     return canceladosAll;
//   });
// }

/**
 * Call Zapi.
 * @constructor
 * @param {Array} message - Text or url of Image or Document
 * @param {Array} messageType - Type of message(image,text,document).
 * @param {JSON} parametros = {whatsAppCel, id, token} - parametros entrada
 * @param {number} index - Index of arrays
 */
function callZapiV2(message, messageType, parametros, index) {
  console.log("Entrou callZapiv2");
  let postData = "";
  let postDataObj = {};

  const request = new XMLHttpRequest();

  // LIST
  // console.log("list:  "+ JSON.stringify(parametros.optionList));
  let strOptionList = null;

  if (parametros.optionList) {
    // console.log("Entrou if parametros.optionList");
    strOptionList = parametros.optionList;
  }

  const urlZapi = "https://api.z-api.io/instances/" +
    parametros.id + "/token/" +
    parametros.token + "/send-" + messageType[index];
  // console.log("urlZapi: " + urlZapi);
  request.open("POST", urlZapi, true);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Client-Token",
      "Fe948ba6a317942849b010c88cd9e6105S");

  if (messageType[index] == "text") {
    postDataObj = {
      "phone": parametros.whatsAppCel,
      "message": message[index],
    };
  } else if (messageType[index] == "document/pdf") {
    postDataObj = {
      "phone": parametros.whatsAppCel,
      "document": message[index],
      "fileName": "arquivo.pdf",
    };
  } else if (messageType[index] == "video") {
    postDataObj = {
      "phone": parametros.whatsAppCel,
      "video": message[index],
      "caption": "",
    };
  } else {
    postDataObj = {
      "phone": parametros.whatsAppCel,
      [messageType[index]]: message[index],
    };
  }
  // console.log("strOptionList:" + JSON.stringify(strOptionList));
  // console.log("postData:" + JSON.stringify(postData));
  if (strOptionList) {
    console.log("entrou no postData.opitionsList");
    postDataObj.optionList = strOptionList;
  }
  postData = JSON.stringify(postDataObj);

  // console.log("New postData "+ postData);
  if (ambiente == "teste" & testeCelularZApi == "on") {
    const chamarFunctionMsgReceb = "run";
    celularZApi(postData, chamarFunctionMsgReceb);
  } else {
    request.send(postData);
    request.onload = () => {
      if (request.status == 200) {
        console.log("Z-API chamado com sucesso.");
        ++index;
        if (index < message.length) {
          callZapiV2(message, messageType, parametros, index);
        }
      } else {
        console.log("Erro chamando Z-API. [callZapiV2]");
        return null;
      }
    };
  }
}

/**
 * Call Zapi.
 * @constructor
 * @param {Array} arrMessage - Text or url of Image or Document
 * @param {JSON} parametros = {id, token} - parametros entrada
 * @param {number} index - Index of arrays
 */
function callZapiV3(arrMessage, parametros, index) {
  console.log("Entrou callZapiv3");
  let postData = "";
  let postDataObj = {};

  // console.log("arrMessage:", JSON.stringify(arrMessage));
  // console.log("parametros:", JSON.stringify(parametros));

  const request = new XMLHttpRequest();

  // console.log("list:  "+ JSON.stringify(parametros.optionList));
  let strOptionList = null;
  let strButtonList = null;
  let messageType;


  if (parametros.optionList) {
    // console.log("Entrou if parametros.optionList");
    strOptionList = parametros.optionList;
  } else if (parametros.buttonList) {
    strButtonList = parametros.buttonList;
  }

  if (arrMessage[index].video) {
    messageType = "video";
  } else if (arrMessage[index].image) {
    messageType = "image";
  } else if (arrMessage[index].document) {
    messageType = "document/pdf";
  } else if (arrMessage[index].buttonActions) {
    messageType = "button-actions";
  } else {
    messageType = "text";
  }

  postDataObj = arrMessage[index];
  if (strOptionList) {
    console.log("entrou no postData.opitionsList");
    postDataObj.optionList = strOptionList;
  } else if (strButtonList) {
    console.log("entrou no postData.buttonList");
    messageType = "button-list";
    postDataObj.buttonList = strButtonList;
  }

  // 🔴 PULAR mensagens de TEXTO vazias
  if (messageType === "text") {
    const msg = (postDataObj.message).trim();

    if (!msg) {
      console.log(`Mensagem vazia para phone ${postDataObj.phone}, ` +
        `pulando index ${index}`);

      const nextIndex = index + 1;
      if (nextIndex < arrMessage.length) {
        callZapiV3(arrMessage, parametros, nextIndex);
      }
      return; // não envia nada para Z-API
    }
  }
  postData = JSON.stringify(postDataObj);


  const urlZapi = "https://api.z-api.io/instances/" +
    parametros.id + "/token/" +
    parametros.token + "/send-" + messageType;
  // console.log("urlZapi: " + urlZapi);
  request.open("POST", urlZapi, true);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Client-Token",
      "Fe948ba6a317942849b010c88cd9e6105S");

  console.log("New postData "+ postData);
  if (ambiente == "teste" && testeCelularZApi == "on") {
    const chamarFunctionMsgReceb = "run";
    celularZApi(postData, chamarFunctionMsgReceb);
  } else {
    request.send(postData);
    request.onload = () => {
      // teste de envio
      console.log("urlZapi:", urlZapi);
      console.log("parametros em callZapiV3:", JSON.stringify(parametros));
      console.log("postData:", postData);
      if (request.status == 200) {
        console.log("Z-API chamado com sucesso.");
        ++index;
        if (index < arrMessage.length) {
          callZapiV3(arrMessage, parametros, index);
        }
      } else {
        console.log("Erro chamando Z-API. [callZapiV3]", {
          status: request.status,
          statusText: request.statusText,
          responseText: request.responseText,
        });
        return null;
      }
    };
  }
}


/**
 * Envia uma lista de templates (modelos) via WhatsApp Cloud API.
 *
 * @param {Array} arrMessage - Array de objetos com dados do template.
 * @param {Object} parametros - { phoneNumberId, accessToken }
 * @param {number} index - Índice do array (use 0 na primeira chamada)
 */
function callWaApi(arrMessage, parametros, index) {
  console.log("Entrou callWaApi");

  // fim da recursão
  if (!Array.isArray(arrMessage) || index >= arrMessage.length) {
    console.log("✅ Todos envios de modelos concluídos.");
    return;
  }

  // corpo base
  const msg = arrMessage[index];
  console.log("msg: " + JSON.stringify(msg));
  const bodyObj = {
    messaging_product: "whatsapp",
    to: msg.phone,
  };

  // se veio interactive (botões)
  if (msg.interactive) {
    bodyObj.type = "interactive";
    bodyObj.interactive = msg.interactive;

  // se veio template (modelos Meta)
  } else if (msg.template) {
    bodyObj.type = "template";
    bodyObj.template = {
      namespace: msg.template.namespace,
      name: msg.template.name,
      language: msg.template.language,
      components: msg.template.components,
    };
  // texto simples
  } else {
    bodyObj.type = "text";
    bodyObj.text = {body: msg.text || ""};
  }

  const bodyString = JSON.stringify(bodyObj);
  console.log("bodyString: " + bodyString);

  // chamada HTTPS
  const options = {
    hostname: "graph.facebook.com",
    path: "/v19.0/" + parametros.phoneNumberId + "/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + parametros.accessToken,
    },
  };

  const req = https.request(options, (res) => {
    let buff = "";
    res.on("data", (chunk) => {
      buff += chunk;
    });
    res.on("end", () => {
      console.log("✅ Enviado p/ " + msg.phone +
          " - resposta FB:", buff);
      // envia o próximo
      callWaApi(arrMessage, parametros, index + 1);
    });
  });

  req.on("error", (err) => {
    console.error("❌ Erro WA API (template):", err);
  });

  req.write(bodyString);
  req.end();

  console.log("callWaApi disparado para item", index);
}


// ------------- função teste de leitura do nós cancelados --------------
exports.testeCanceladosAll = functions.https
    .onRequest((req, resp) => {
      console.log("Entrou teste canceladosAll");
      oft45CanceladosAll().then((res) => {
        console.log("log do testeCanceladosAll"+ JSON
            .stringify(res));
        resp.end("Ok"+resp.status.toString());
      });
    });

/**
 * Cancelados Automáticos + Cancelados Planilha 45.
*@constructor
*@param {JSON} testeQtdCancelados
 */
function oft45CanceladosAll(testeQtdCancelados) {
  const promises = [];
  const db = admin.database();
  console.log("Entrou oft45CanceladosAll");

  let sheetId = "";
  // if (ambiente === "teste") {
  //   sheetId = "1e1LyzjrUYnzzGl_ypGV53o7re0TnJEOew-eEJFnBtB0";
  // } else {
  sheetId = "1jApb1NOrMYoLce8MKxkUSLBpwEXbe1N1b33di08Ww40";
  // }
  promises.push(db.ref("OFT/45/_dadosComuns/cancelados/" + sheetId +
      "/Cancelados")
      .once("value"));

  promises.push(db.ref("OFT/45/_dadosComuns/cancelados/automatico")
      .once("value"));

  return Promise.all(promises).then((res) => {
    console.log("Entrou Promise calceladosAll45");
    const canceladosPlanilha = res[0].val();
    const canceladosAutomatico = res[1].val();
    // console.log("canceladosPlanilha"+JSON.stringify(canceladosPlanilha));
    // console.log("canceladosAutomatico"+JSON.stringify(canceladosAutomatico));
    const canceladosAll = Object
        .assign(canceladosAutomatico, canceladosPlanilha);
    return canceladosAll;
  });
}

/**
 * Cancelados Automáticos + Cancelados Planilha 45.
*@constructor
*@param {JSON} testeQtdCancelados
 */
function cioCanceladosAll(testeQtdCancelados) {
  const promises = [];
  const db = admin.database();
  console.log("Entrou cioCanceladosAll");

  let sheetId = "";
  if (ambiente === "teste") {
    sheetId = "1Wb8t8_Co2Z5MGAtHYHZo6Q7o0GqianCF2fH2-gm0d6g";
  } else {
    sheetId = "1Wb8t8_Co2Z5MGAtHYHZo6Q7o0GqianCF2fH2-gm0d6g";
  }
  promises.push(db.ref("CIO/_dadosComuns/cancelados/" + sheetId +
      "/Cancelados")
      .once("value"));

  promises.push(db.ref("CIO/_dadosComuns/cancelados/automatico")
      .once("value"));

  return Promise.all(promises).then((res) => {
    console.log("Entrou Promise cioCanceladosAll");
    const canceladosPlanilha = res[0].val();
    const canceladosAutomatico = res[1].val();

    console.log("canceladosPlanilha: "+ JSON.stringify(canceladosPlanilha));

    console.log("canceladosAutomatico: " +
        JSON.stringify(canceladosAutomatico));

    const canceladosAll = Object
        .assign(canceladosAutomatico, canceladosPlanilha);

    console.log("canceladosAll:: "+JSON.stringify(canceladosAll));
    return canceladosAll;
  });
}

/**
 * tel2Whats - Converts a raw cellphone number into a WhatsApp format
 * @constructor
 * @param {string} tel - raw telephone
 * @param {string} whatsAppCel - WhatsApp
 */
function tel2Whats(tel) {
  let whatsAppCel = "";
  /*
  tel = tel.replace("(", "");
  tel = tel.replace(")", "");
  tel = tel.replace("(", "");
  tel = tel.replace(")", "");
  tel = tel.replace("(", "");
  tel = tel.replace(")", "");
  tel = tel.replace(".", "");
  tel = tel.replace(".", "");
  tel = tel.replace(".", "");
  tel = tel.replace(".", "");
  tel = tel.replace(" ", "");
  tel = tel.replace(" ", "");
  tel = tel.replace(" ", "");
  tel = tel.replace(" ", "");
  tel = tel.replace(" ", "");
  tel = tel.replace(" ", "");
  tel = tel.replace(" ", "");
  tel = tel.replace("-", "");
  tel = tel.replace("-", "");
  tel = tel.replace("/", "");
  tel = tel.replace("/", "");
  tel = tel.replace("/", "");
  tel = tel.replace("[", "");
  tel = tel.replace("]", "");
  tel = tel.replace("#", "");
  tel = tel.replace("#", "");
  tel = tel.replace("#", "");
  tel = tel.replace("$", "");
  tel = tel.replace("$", "");
  tel = tel.replace("$", "");
  tel = tel.replace("+", "");
  tel = tel.replace("+", "");
  tel = tel.replace("+", "");
  tel = tel.replace("\\", "");
  tel = tel.replace("\r\n", "");
  */
  let telAux = [];
  for (let i = 0; i < tel.length; i++) {
    if ((tel[i] === "0") ||
        (tel[i] === "1") ||
        (tel[i] === "2") ||
        (tel[i] === "3") ||
        (tel[i] === "4") ||
        (tel[i] === "5") ||
        (tel[i] === "6") ||
        (tel[i] === "7") ||
        (tel[i] === "8") ||
        (tel[i] === "9")
    ) {
      telAux = telAux + tel[i];
    }
  }
  tel = telAux;
  // console.log("element.Telefone: " + element.Telefone);
  // console.log("telAux: " + telAux);
  if ((tel.length === 9)&&(tel.substring(0, 1) == "9")) {
    whatsAppCel = "5521" + tel;
    // console.log("Entrou no IF tel.length = 9");
  } else if ((tel.length === 11)&&(tel.substring(2, 3)=="9")) {
    whatsAppCel = "55" + tel;
    // console.log("Entrou no IF tel.length = 11");
  } else if ((tel.length === 13)&&(tel.substring(4, 5)=="9")) {
    whatsAppCel = tel;
    // console.log("Entrou no IF tel.length = 13");
  }
  return whatsAppCel;
}


exports.atendimentoRapidoUsinaZApi =
    functions.database.ref("atendimentoRapidoUsinaAEnviar/{pushId}")
        .onWrite((change, context) => {
          // Only edit data when it is first created.
          // if (change.before.exists()) {
          // return null;
          // }
          // Exit when the data is deleted.
          if (!change.after.exists()) {
            return null;
          }
          const db = admin.database();
          // Grab the current value of what was written to the Realtime Database
          const element = change.after.val();
          console.log(JSON.stringify(element));
          // const endereco = "Rua Carlos de Laet 11, Tijuca";
          // console.log("forEach. element:" + JSON.stringify(element));
          let paciente = "";
          let dataMarcada = "";
          // let medico = "";
          // let convenio = "";
          let telCom = "";
          let telRes = "";
          let tel = "";
          let telCel = "";
          if (element.Paciente) {
            paciente = element.Paciente;
          }
          if (element.DataMarcada) {
            dataMarcada = element.DataMarcada;
          }
          /*
          if (element.Medico) {
            medico = element.Medico;
          }
          if (element.Convenio) {
            convenio = element.Convenio;
          }
          */
          if (element.TelefoneCom) {
            telCom = element.TelefoneCom.replace("(", "");
            telCom = telCom.replace(")", "");
            telCom = telCom.replace(".", "");
            telCom = telCom.replace(" ", "");
            telCom = telCom.replace("-", "");
            telCom = telCom.replace("-", "");
            // console.log("element.TelefoneCom: " + element.TelefoneCom);
            // console.log("telCom: " + telCom);
          }
          if (element.TelefoneCel) {
            telCel = element.TelefoneCel.replace("(", "");
            telCel = telCel.replace(")", "");
            telCel = telCel.replace(".", "");
            telCel = telCel.replace(" ", "");
            telCel = telCel.replace("-", "");
            telCel = telCel.replace("-", "");
            // console.log("element.TelefoneCel: " + element.TelefoneCel);
            // console.log("telCel: " + telCel);
          }
          if (element.TelefoneRes) {
            telRes = element.TelefoneRes.replace("(", "");
            telRes = telRes.replace(")", "");
            telRes = telRes.replace(".", "");
            telRes = telRes.replace(" ", "");
            telRes = telRes.replace("-", "");
            telRes = telRes.replace("-", "");
            // console.log("element.TelefoneRes: " + element.TelefoneRes);
            // console.log("telRes: " + telRes);
          }
          if (element.Telefone) {
            tel = element.Telefone.replace("(", "");
            tel = tel.replace(")", "");
            tel = tel.replace(".", "");
            tel = tel.replace(" ", "");
            tel = tel.replace("-", "");
            tel = tel.replace("-", "");
            // console.log("element.Telefone: " + element.Telefone);
            // console.log("tel: " + tel);
          }
          let whatsAppCel = "";
          if (tel) {
            if ((tel.length = 9)&&(tel.substring(0, 1) == "9")) {
              whatsAppCel = "5521" + tel;
            } else if ((tel.length = 11)&&(tel.substring(2, 3)=="9")) {
              whatsAppCel = "55" + tel;
            }
          } else if (telCel) {
            if ((telCel.length = 9)&&(telCel.substring(0, 1) == "9")) {
              whatsAppCel = "5521" + telCel;
            } else if ((telCel.length = 11)&&(telCel.substring(2, 3)=="9")) {
              whatsAppCel = "55" +telCel;
            }
          } else if (telRes) {
            if ((telRes.length = 9)&&(telRes.substring(0, 1) == "9")) {
              whatsAppCel = "5521" + telRes;
            } else if ((telRes.length = 11)&&(telRes.substring(2, 3)=="9")) {
              whatsAppCel = "55" + telRes;
            }
          } else if (telCom) {
            if ((telCom.length = 9)&&(telCom.substring(0, 1) == "9")) {
              whatsAppCel = "5521" + telCom;
            } else if ((telCom.length = 11)&&(telCom.substring(2, 3)=="9")) {
              whatsAppCel = "55" + telCom;
            }
          }

          // console.log("whatsAppCel: " + whatsAppCel);
          if (whatsAppCel) {
            // dd/mm/yyyy hh:mm
            const year = dataMarcada.split("/")[2].split(" ")[0];
            const mm = dataMarcada.split("/")[1];
            const dd = dataMarcada.split("/")[0];
            // const hh = dataMarcada.substring(9, 10);
            // const min = dataMarcada.substring(12, 13);
            const message1 = "Olá! Aqui é da Oftalmo Day," +
            " hospital oftalmológico." +
            "\n\nGostaríamos de lhe passar algumas informações" +
            " importantes para que a internação de " +
            paciente + " seja ágil:" +
            "\n\n- é obrigatório trazer RG" +
            " do paciente (impressa, xerox ou via" +
            " WhatsApp)." +
            "\n- somente um acompanhante por paciente será autorizado a" +
            " permanecer dentro da clínica" +
            "\n- preencha seus dados cadastrais no link" +
            "\n\n https://form.typeform.com/to/EqlMh8Yl#idmarcacaocirurgia=" +
            element.IDMarcacaoCirurgia +
            "\n\n(caso não funcione, copie o endereço acima e cole no " +
            "navegador Google Chrome)." +
            "\n\nQualquer dúvida, pode nos chamar por aqui." +
            " Boa cirurgia! Até logo!";
            // console.log(message1);
            // Z-API
            // console.log("Vai executar XMLHttpRequest.");
            const postData = JSON.stringify({
              "phone": whatsAppCel,
              "message": message1,
            });

            const req = new XMLHttpRequest();

            const urlZapi = "https://api.z-api.io/instances/" +
              "3A87852FD92C60C145272A5EFA8E6022/token/" +
              "B2FB73CD5A709BD1C2AD96F9/send-text";
            req.open("POST", urlZapi, true);
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Client-Token",
                "Fe948ba6a317942849b010c88cd9e6105S");
            /*
            req.onreadystatechange = () => {
              console.log("Entrou readyState: " + req.readyState);
            };
            */
            req.onerror = () => {
              console.log("Entrou onerror: " + req.statusText);
            };
            req.onload = () => {
              console.log("Entrou onload. req.status: " + req.status);
              if (req.status == 200) {
                console.log("Z-API chamado com sucesso: " + whatsAppCel);
                let refEnviados = db.ref("atendimentoRapidoUsinaEnviados");
                console.log(dataMarcada);
                console.log(year+"/"+mm+"/"+dd);
                refEnviados = refEnviados.child(year+"/"+mm+"/"+dd);
                refEnviados.push(element);
                const pushID = context.params.pushId;
                const refAEnviar = db.ref("atendimentoRapidoUsinaAEnviar/" +
                   pushID);
                refAEnviar.set(null);
              } else {
                console.log("Erro chamando Z-API.");
              }
            };
            // setTimeout(function() {
            // req.send(postData);
            // }, 500);
            req.send(postData);
            console.log("req.send(postData): " + postData);
          }
          // You must return a Promise when performing
          // asynchronous tasks inside a Functions such as
          // writing to the Firebase Realtime Database.
          // Setting an "uppercase" sibling
          // in the Realtime Database returns a Promise.
          return null;
        });

// exports.atendimentoRapidoUsinaJson = functions.https.
//     onRequest((req, resp) => {
exports.atendimentoRapidoUsinaJson = functions.pubsub
    .schedule("00 14 * * *")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou Função atendimentoRapidoUsinaJson");
      const today = new Date();
      const year = today.getFullYear();
      const mm = today.getMonth()+1;
      const dd = today.getDate();
      const diaDaSemana = today.getDay();
      if (diaDaSemana != 0 && diaDaSemana != 6 ) {
        try {
          // make sure that any items are correctly
          // URL encoded in the connection string
          // console.log("Entrou try");
          return sqlConnection.connect(sqlConfig).then((pool) => {
            // pool.sqlConnection.connect(sqlConfig);
            // console.log("Entrou connect");
            let sql = "";
            if (diaDaSemana == 5) {
              sql = "SELECT * ";
              sql = sql + "FROM dbo.vw_GSht_Age_MarcacaoCirurgia_Confirmacao ";
              sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 1 + ",";
              sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
              sql = sql + ",0,0,0,0)) ";
              sql = sql + "AND  DataMarcada < DATEADD(dd," + 4 + ",";
              sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
              sql = sql + ",0,0,0,0)) ";
              sql = sql + "AND    IDEmpresa = 101 "; // 101 para Usina
              sql = sql + "ORDER BY DataMarcada";
            } else {
              sql = "SELECT * ";
              sql = sql + "FROM dbo.vw_GSht_Age_MarcacaoCirurgia_Confirmacao ";
              sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 1 + ",";
              sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
              sql = sql + ",0,0,0,0)) ";
              sql = sql + "AND  DataMarcada < DATEADD(dd," + 2 + ",";
              sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
              sql = sql + ",0,0,0,0)) ";
              sql = sql + "AND    IDEmpresa = 101 "; // 101 para Usina
              sql = sql + "ORDER BY DataMarcada";
            }
            return pool.query(sql);
            // const result = pool.query(sql);
          }).then((result) => {
            const db = admin.database();
            const ref = db.ref("atendimentoRapidoUsinaAEnviar");
            console.log("Resultado:" + JSON.stringify(result));
            result.recordset.forEach((element) => {
              /*
              const year = element.DataMarcada.substring(0, 3);
              const mm = element.DataMarcada.substring(5, 6);
              const dd = element.DataMarcada.substring(8, 9);
              const hh = element.DataMarcada.substring(11, 12);
              const min = element.DataMarcada.substring(14, 15);
              */
              const year = element.DataMarcada.getFullYear();
              const mm = element.DataMarcada.getMonth()+1;
              const dd = element.DataMarcada.getDate();
              const hh = element.DataMarcada.getHours();
              let min = element.DataMarcada.getMinutes();
              if (min == 0 ) {
                min = "00";
              }
              const dataMarcada = dd + "/" + mm + "/" +
                year + "  " + hh + ":" + min;
              element.DataMarcada = dataMarcada;
              ref.push(element);
            });
            const msgConfirmacao = `FUNCTION EXECUTADA COM SUCESSO!
            \n*nome*: atendimentoRapidoUsinaJson`;
            enviarMensagemWhatsApp("5521971938840", msgConfirmacao, "usina");

            // ref.set(true);
            return null;
          });
        } catch (err) {
          // ... error checks
          console.log("Erro try: " + JSON.stringify(err));
        }
      }
    });

exports.atendimentoRapidoUsinaErro = functions.pubsub
    .schedule("05 14 * * *")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou Função confirmação Pacientes Erro");
      const db = admin.database();
      const dbRef = admin.database();

      dbRef.ref("atendimentoRapidoUsinaAEnviar").once("value")
          .then((snapshot) => {
            if (snapshot.exists()) {
              console.log("Entrou Get");
              console.log(snapshot.val());
              const pacientesNãoEnviados = snapshot.val();
              const refErro= db.ref("atendimentoRapidoUsinaErro");
              refErro.set(pacientesNãoEnviados);
              const ref = db.ref("atendimentoRapidoUsinaAEnviar");
              ref.set(true);
              // ...
            } else {
              console.log("No data available");
            }
          }).catch((error) => {
            console.error(error);
          });
      return null;
    });

exports.pesquisaSatisfacaoUsinaZApi =
    functions.database.ref("pesquisaSatisfacaoUsinaAEnviar/{pushId}")
        .onWrite((change, context) => {
          // Only edit data when it is first created.
          // if (change.before.exists()) {
          // return null;
          // }
          // Exit when the data is deleted.
          if (!change.after.exists()) {
            return null;
          }
          const db = admin.database();
          // Grab the current value of what was written to the Realtime Database
          const element = change.after.val();
          console.log(JSON.stringify(element));
          // const endereco = "Praça Saenz Pena 45, sala 1508";
          // console.log("forEach. element:" + JSON.stringify(element));
          let paciente = "";
          let dataMarcada = "";
          // let medico = "";
          // let convenio = "";
          let telCom = "";
          let telRes = "";
          let tel = "";
          let telCel = "";
          if (element.Paciente) {
            paciente = element.Paciente;
          }
          if (element.DataMarcada) {
            dataMarcada = element.DataMarcada;
          }
          /*
          if (element.Medico) {
            medico = element.Medico;
          }
          if (element.Convenio) {
            convenio = element.Convenio;
          }
          */
          if (element.TelefoneCom) {
            telCom = element.TelefoneCom.replace("(", "");
            telCom = telCom.replace(")", "");
            telCom = telCom.replace(".", "");
            telCom = telCom.replace(" ", "");
            telCom = telCom.replace("-", "");
            telCom = telCom.replace("-", "");
            // console.log("element.TelefoneCom: " + element.TelefoneCom);
            // console.log("telCom: " + telCom);
          }
          if (element.TelefoneCel) {
            telCel = element.TelefoneCel.replace("(", "");
            telCel = telCel.replace(")", "");
            telCel = telCel.replace(".", "");
            telCel = telCel.replace(" ", "");
            telCel = telCel.replace("-", "");
            telCel = telCel.replace("-", "");
            // console.log("element.TelefoneCel: " + element.TelefoneCel);
            // console.log("telCel: " + telCel);
          }
          if (element.TelefoneRes) {
            telRes = element.TelefoneRes.replace("(", "");
            telRes = telRes.replace(")", "");
            telRes = telRes.replace(".", "");
            telRes = telRes.replace(" ", "");
            telRes = telRes.replace("-", "");
            telRes = telRes.replace("-", "");
            // console.log("element.TelefoneRes: " + element.TelefoneRes);
            // console.log("telRes: " + telRes);
          }
          if (element.Telefone) {
            tel = element.Telefone.replace("(", "");
            tel = tel.replace(")", "");
            tel = tel.replace(".", "");
            tel = tel.replace(" ", "");
            tel = tel.replace("-", "");
            tel = tel.replace("-", "");
            // console.log("element.Telefone: " + element.Telefone);
            // console.log("tel: " + tel);
          }
          let whatsAppCel = "";
          if (tel&&(tel.substring(2, 3) == "9")) {
            whatsAppCel = "55" + tel;
          } else if ((telCel)&&(telCel.substring(2, 3) == "9")) {
            whatsAppCel = "55" + telCel;
          } else if ((telRes)&&(telRes.substring(2, 3) == "9")) {
            whatsAppCel = "55" + telRes;
          } else if ((telCom)&&(telCom.substring(2, 3) == "9")) {
            whatsAppCel = "55" + telCom;
          }

          // console.log("whatsAppCel: " + whatsAppCel);
          if (whatsAppCel) {
            // dd/mm/yyyy hh:mm
            const year = dataMarcada.split("/")[2].split(" ")[0];
            const mm = dataMarcada.split("/")[1];
            const dd = dataMarcada.split("/")[0];
            // const hh = dataMarcada.substring(9, 10);
            // const min = dataMarcada.substring(12, 13);

            const message1 = "Olá! Aqui é da Oftalmo Day." +
            "\n\nObrigado por nos escolher para a cirurgia de " +
            paciente + "." +
            "\n\nPara que possamos melhorar ainda mais, por favor clique " +
            "no link, avalie-nos no Google e deixe um comentário " +
            "(leva em média 1 minuto). " +
            "\n\nSua opinião é muito importante para nós! " +
            "\n\n  https://g.page/r/CbHg5pcQW8vWEBM/review " +
            "\n\nObrigado e até a próxima!";
            // console.log(message1);
            // Z-API
            // console.log("Vai executar XMLHttpRequest.");
            const postData = JSON.stringify({
              "phone": whatsAppCel,
              "message": message1,
            });

            const req = new XMLHttpRequest();
            const urlZapi = "https://api.z-api.io/instances/" +
            "3A87852FD92C60C145272A5EFA8E6022/token/" +
            "B2FB73CD5A709BD1C2AD96F9/send-text";
            req.open("POST", urlZapi, true);
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Client-Token",
                "Fe948ba6a317942849b010c88cd9e6105S");
            /*
            req.onreadystatechange = () => {
              console.log("Entrou readyState: " + req.readyState);
            };
            */
            req.onerror = () => {
              console.log("Entrou onerror: " + req.statusText);
            };
            req.onload = () => {
              console.log("Entrou onload. req.status: " + req.status);
              if (req.status == 200) {
                console.log("Z-API chamado com sucesso: " + whatsAppCel);
                let refEnviados = db.ref("pesquisaSatisfacaoUsinaEnviados");
                console.log(dataMarcada);
                console.log(year+"/"+mm+"/"+dd);
                refEnviados = refEnviados.child(year+"/"+mm+"/"+dd);
                refEnviados.push(element);
                const pushID = context.params.pushId;
                const refAEnviar = db.ref("pesquisaSatisfacaoUsinaAEnviar/" +
                   pushID);
                refAEnviar.set(null);
              } else {
                console.log("Erro chamando Z-API.");
              }
            };
            // setTimeout(function() {
            // req.send(postData);
            // }, 500);
            req.send(postData);
            console.log("req.send(postData): " + postData);
          }
          // You must return a Promise when performing
          // asynchronous tasks inside a Functions such as
          // writing to the Firebase Realtime Database.
          // Setting an "uppercase" sibling
          // in the Realtime Database returns a Promise.
          return null;
        });

exports.pesquisaSatisfacaoUsinaJson = functions.pubsub
    .schedule("10 14 * * *")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou Função pesquisaSatisfacaoUsinaJson");
      const today = new Date();
      const year = today.getFullYear();
      const mm = today.getMonth()+1;
      const dd = today.getDate();
      // const diaDaSemana = today.getDay();
      try {
        // make sure that any items are correctly
        // URL encoded in the connection string
        // console.log("Entrou try");
        return sqlConnection.connect(sqlConfig).then((pool) => {
          // pool.sqlConnection.connect(sqlConfig);
          // console.log("Entrou connect");
          let sql = "";
          sql = "SELECT * ";
          sql = sql + "FROM   dbo.vw_GSht_Age_MarcacaoCirurgia_Confirmacao ";
          sql = sql + "WHERE  IDEmpresa = 101 ";
          sql = sql + "AND  DataMarcada < DATEADD(dd," + 0 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "AND  DataMarcada >= DATEADD(dd," + -1 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "ORDER BY DataMarcada";
          return pool.query(sql);
          // const result = pool.query(sql);
        }).then((result) => {
          const db = admin.database();
          const ref = db.ref("pesquisaSatisfacaoUsinaAEnviar");
          console.log(JSON.stringify(result.recordset[0]));
          console.log(JSON.stringify(result));
          result.recordset.forEach((element) => {
            /*
            const year = element.DataMarcada.substring(0, 3);
            const mm = element.DataMarcada.substring(5, 6);
            const dd = element.DataMarcada.substring(8, 9);
            const hh = element.DataMarcada.substring(11, 12);
            const min = element.DataMarcada.substring(14, 15);
            */
            const year = element.DataMarcada.getFullYear();
            const mm = element.DataMarcada.getMonth()+1;
            const dd = element.DataMarcada.getDate();
            const hh = element.DataMarcada.getHours();
            let min = element.DataMarcada.getMinutes();
            if (min == 0 ) {
              min = "00";
            }
            const dataMarcada = dd + "/" + mm + "/" +
              year + "  " + hh + ":" + min;
            element.DataMarcada = dataMarcada;
            ref.push(element);
          });
          const msgConfirmacao = `FUNCTION EXECUTADA COM SUCESSO!
          \n*nome*: pesquisaSatisfacaoUsinaJson`;
          enviarMensagemWhatsApp("5521971938840", msgConfirmacao, "usina");

          // ref.set(true);
          return null;
        });
      } catch (err) {
        // ... error checks
        console.log("Erro try: " + JSON.stringify(err));
      }
    });

exports.pesquisaSatisfacaoUsinaErro = functions.pubsub
    .schedule("11 14 * * *")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou Função pesquisa de Satifação Usina Erro");
      const db = admin.database();
      const dbRef = admin.database();

      dbRef.ref("pesquisaSatisfacaoUsinaAEnviar").once("value")
          .then((snapshot) => {
            if (snapshot.exists()) {
              // console.log("Entrou Get");
              // console.log(snapshot.val());
              const pacientesNãoEnviados = snapshot.val();
              const refErro= db.ref("pesquisaSatisfacaoUsinaErro");
              refErro.set(pacientesNãoEnviados);
              const ref = db.ref("pesquisaSatisfacaoUsinaAEnviar");
              ref.set(true);
              // ...
            } else {
              console.log("No data available");
            }
          }).catch((error) => {
            console.error(error);
          });
      return null;
    });

exports.internacaoRapidaRDHJson = functions.pubsub
    .schedule("10 10 * * *")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou Função internacaoRapidaRDHJson");
      const today = new Date();
      const year = today.getFullYear();
      const mm = today.getMonth()+1;
      const dd = today.getDate();
      const diaDaSemana = today.getDay();
      if (diaDaSemana != 0 && diaDaSemana != 6 ) {
        try {
          // make sure that any items are correctly
          // URL encoded in the connection string
          // console.log("Entrou try");
          return sqlConnection.connect(sqlConfig).then((pool) => {
            // pool.sqlConnection.connect(sqlConfig);
            // console.log("Entrou connect");
            let sql = "";
            if (diaDaSemana == 5) {
              sql = "SELECT * ";
              sql = sql + "FROM dbo.vw_GSht_Age_MarcacaoCirurgia_Confirmacao ";
              sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 1 + ",";
              sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
              sql = sql + ",0,0,0,0)) ";
              sql = sql + "AND  DataMarcada < DATEADD(dd," + 4 + ",";
              sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
              sql = sql + ",0,0,0,0)) ";
              sql = sql + "AND    IDEmpresa = 102 "; // 101 para Usina
              sql = sql + "ORDER BY DataMarcada";
            } else {
              sql = "SELECT * ";
              sql = sql + "FROM dbo.vw_GSht_Age_MarcacaoCirurgia_Confirmacao ";
              sql = sql + "WHERE  DataMarcada >= DATEADD(dd," + 1 + ",";
              sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
              sql = sql + ",0,0,0,0)) ";
              sql = sql + "AND  DataMarcada < DATEADD(dd," + 2 + ",";
              sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
              sql = sql + ",0,0,0,0)) ";
              sql = sql + "AND    IDEmpresa = 102 "; // 101 para Usina
              sql = sql + "ORDER BY DataMarcada";
            }
            return pool.query(sql);
            // const result = pool.query(sql);
          }).then((result) => {
            const db = admin.database();
            const ref = db.ref("internacaoRapidaRDHAEnviar");
            console.log("Resultado:" + JSON.stringify(result));
            result.recordset.forEach((element) => {
              /*
              const year = element.DataMarcada.substring(0, 3);
              const mm = element.DataMarcada.substring(5, 6);
              const dd = element.DataMarcada.substring(8, 9);
              const hh = element.DataMarcada.substring(11, 12);
              const min = element.DataMarcada.substring(14, 15);
              */
              const year = element.DataMarcada.getFullYear();
              const mm = element.DataMarcada.getMonth()+1;
              const dd = element.DataMarcada.getDate();
              const hh = element.DataMarcada.getHours();
              let min = element.DataMarcada.getMinutes();
              if (min == 0 ) {
                min = "00";
              }
              const dataMarcada = dd + "/" + mm + "/" +
                year + "  " + hh + ":" + min;
              element.DataMarcada = dataMarcada;
              ref.push(element);
            });
            // ref.set(true);
            return null;
          });
        } catch (err) {
          // ... error checks
          console.log("Erro try: " + JSON.stringify(err));
        }
      }
    });

exports.internacaoRapidaRDHZApi =
    functions.database.ref("internacaoRapidaRDHAEnviar/{pushId}")
        .onWrite((change, context) => {
          // Only edit data when it is first created.
          // if (change.before.exists()) {
          // return null;
          // }
          // Exit when the data is deleted.
          if (!change.after.exists()) {
            return null;
          }
          const db = admin.database();
          // Grab the current value of what was written to the Realtime Database
          const element = change.after.val();
          console.log(JSON.stringify(element));
          // const endereco = "Rua Carlos de Laet 11, Tijuca";
          // console.log("forEach. element:" + JSON.stringify(element));
          let paciente = "";
          let dataMarcada = "";
          // let medico = "";
          // let convenio = "";
          let telCom = "";
          let telRes = "";
          let tel = "";
          let telCel = "";
          if (element.Paciente) {
            paciente = element.Paciente;
          }
          if (element.DataMarcada) {
            dataMarcada = element.DataMarcada;
          }
          /*
          if (element.Medico) {
            medico = element.Medico;
          }
          if (element.Convenio) {
            convenio = element.Convenio;
          }
          */
          if (element.TelefoneCom) {
            telCom = element.TelefoneCom.replace("(", "");
            telCom = telCom.replace(")", "");
            telCom = telCom.replace(".", "");
            telCom = telCom.replace(" ", "");
            telCom = telCom.replace("-", "");
            telCom = telCom.replace("-", "");
            // console.log("element.TelefoneCom: " + element.TelefoneCom);
            // console.log("telCom: " + telCom);
          }
          if (element.TelefoneCel) {
            telCel = element.TelefoneCel.replace("(", "");
            telCel = telCel.replace(")", "");
            telCel = telCel.replace(".", "");
            telCel = telCel.replace(" ", "");
            telCel = telCel.replace("-", "");
            telCel = telCel.replace("-", "");
            // console.log("element.TelefoneCel: " + element.TelefoneCel);
            // console.log("telCel: " + telCel);
          }
          if (element.TelefoneRes) {
            telRes = element.TelefoneRes.replace("(", "");
            telRes = telRes.replace(")", "");
            telRes = telRes.replace(".", "");
            telRes = telRes.replace(" ", "");
            telRes = telRes.replace("-", "");
            telRes = telRes.replace("-", "");
            // console.log("element.TelefoneRes: " + element.TelefoneRes);
            // console.log("telRes: " + telRes);
          }
          if (element.Telefone) {
            tel = element.Telefone.replace("(", "");
            tel = tel.replace(")", "");
            tel = tel.replace(".", "");
            tel = tel.replace(" ", "");
            tel = tel.replace("-", "");
            tel = tel.replace("-", "");
            // console.log("element.Telefone: " + element.Telefone);
            // console.log("tel: " + tel);
          }
          let whatsAppCel = "";
          if (tel) {
            if ((tel.length = 9)&&(tel.substring(0, 1) == "9")) {
              whatsAppCel = "5521" + tel;
            } else if ((tel.length = 11)&&(tel.substring(2, 3)=="9")) {
              whatsAppCel = "55" + tel;
            }
          } else if (telCel) {
            if ((telCel.length = 9)&&(telCel.substring(0, 1) == "9")) {
              whatsAppCel = "5521" + telCel;
            } else if ((telCel.length = 11)&&(telCel.substring(2, 3)=="9")) {
              whatsAppCel = "55" +telCel;
            }
          } else if (telRes) {
            if ((telRes.length = 9)&&(telRes.substring(0, 1) == "9")) {
              whatsAppCel = "5521" + telRes;
            } else if ((telRes.length = 11)&&(telRes.substring(2, 3)=="9")) {
              whatsAppCel = "55" + telRes;
            }
          } else if (telCom) {
            if ((telCom.length = 9)&&(telCom.substring(0, 1) == "9")) {
              whatsAppCel = "5521" + telCom;
            } else if ((telCom.length = 11)&&(telCom.substring(2, 3)=="9")) {
              whatsAppCel = "55" + telCom;
            }
          }

          // console.log("whatsAppCel: " + whatsAppCel);
          if (whatsAppCel) {
            // dd/mm/yyyy hh:mm
            const year = dataMarcada.split("/")[2].split(" ")[0];
            const mm = dataMarcada.split("/")[1];
            const dd = dataMarcada.split("/")[0];
            // const hh = dataMarcada.substring(9, 10);
            // const min = dataMarcada.substring(12, 13);
            const message1 = "Olá! Aqui é do Rio Day Hospital." +
            "\n\nGostaríamos de lhe passar algumas informações" +
            " importantes para que a internação de " +
            paciente + " seja ágil:" +
            "\n\n- é obrigatório trazer RG." +
            "\n- somente um acompanhante por paciente será autorizado a" +
            " permanecer dentro do hospital (mesmo na recepção)." +
            "\n- preencha seus dados cadastrais no link" +
            "\n\n https://form.typeform.com/to/b3fDSF#idmarcacaocirurgia=" +
            element.IDMarcacaoCirurgia +
            "\n\n(caso não funcione, copie o endereço acima e cole no " +
            "navegador Google Chrome)." +
            "\n\nQualquer dúvida, pode nos chamar por aqui." +
            " Boa cirurgia! Até logo!";
            // console.log(message1);
            // Z-API
            // console.log("Vai executar XMLHttpRequest.");
            const postData = JSON.stringify({
              "phone": whatsAppCel,
              "message": message1,
            });
            const req = new XMLHttpRequest();
            const urlZapi = "https://api.z-api.io/instances/" +
              "3A86AB874F03509BE904C23DAB4C141D/token/" +
              "A1B7FC0CB9F9105A8975556F/send-text";
            req.open("POST", urlZapi, true);
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Client-Token",
                "Fe948ba6a317942849b010c88cd9e6105S");
            /*
            req.onreadystatechange = () => {
              console.log("Entrou readyState: " + req.readyState);
            };
            */
            req.onerror = () => {
              console.log("Entrou onerror: " + req.statusText);
            };
            req.onload = () => {
              console.log("Entrou onload. req.status: " + req.status);
              if (req.status == 200) {
                console.log("Z-API chamado com sucesso: " + whatsAppCel);
                let refEnviados = db.ref("internacaoRapidaRDHEnviados");
                console.log(dataMarcada);
                console.log(year+"/"+mm+"/"+dd);
                refEnviados = refEnviados.child(year+"/"+mm+"/"+dd);
                refEnviados.push(element);
                const pushID = context.params.pushId;
                const refAEnviar = db.ref("internacaoRapidaRDHAEnviar/" +
                   pushID);
                refAEnviar.set(null);
              } else {
                console.log("Erro chamando Z-API.");
              }
            };
            // setTimeout(function() {
            // req.send(postData);
            // }, 500);
            req.send(postData);
            console.log("req.send(postData): " + postData);
          }
          // You must return a Promise when performing
          // asynchronous tasks inside a Functions such as
          // writing to the Firebase Realtime Database.
          // Setting an "uppercase" sibling
          // in the Realtime Database returns a Promise.
          return null;
        });

exports.internacaoRapidaRDHErro = functions.pubsub
    .schedule("05 12 * * *")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou Função confirmação Pacientes Erro");
      const db = admin.database();
      const dbRef = admin.database();

      dbRef.ref("internacaoRapidaRDHAEnviar").once("value")
          .then((snapshot) => {
            if (snapshot.exists()) {
              console.log("Entrou Get");
              console.log(snapshot.val());
              const pacientesNãoEnviados = snapshot.val();
              const refErro= db.ref("internacaoRapidaRDHErro");
              refErro.set(pacientesNãoEnviados);
              const ref = db.ref("internacaoRapidaRDHAEnviar");
              ref.set(true);
              // ...
            } else {
              console.log("No data available");
            }
          }).catch((error) => {
            console.error(error);
          });
      return null;
    });

exports.pesquisaSatisfacaoRDHJson = functions.pubsub
    .schedule("00 10 * * *")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou Função pesquisaSatisfacaoRDHJson");
      const today = new Date();
      const year = today.getFullYear();
      const mm = today.getMonth()+1;
      const dd = today.getDate();
      // const diaDaSemana = today.getDay();
      try {
        // make sure that any items are correctly
        // URL encoded in the connection string
        // console.log("Entrou try");
        return sqlConnection.connect(sqlConfig).then((pool) => {
          // pool.sqlConnection.connect(sqlConfig);
          // console.log("Entrou connect");
          let sql = "";
          sql = "SELECT * ";
          sql = sql + "FROM   dbo.vw_GSht_Age_MarcacaoCirurgia_Confirmacao ";
          sql = sql + "WHERE  IDEmpresa = 102 ";
          sql = sql + "AND  DataMarcada < DATEADD(dd," + 0 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "AND  DataMarcada >= DATEADD(dd," + -1 + ",";
          sql = sql + "DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
          sql = sql + ",0,0,0,0)) ";
          sql = sql + "ORDER BY DataMarcada";
          return pool.query(sql);
          // const result = pool.query(sql);
        }).then((result) => {
          const db = admin.database();
          const ref = db.ref("RDH/pesquisaSatisfacao/aEnviar");
          ref.set(true);
          console.log(JSON.stringify(result.recordset[0]));
          console.log(JSON.stringify(result));
          result.recordset.forEach((element) => {
            /*
            const year = element.DataMarcada.substring(0, 3);
            const mm = element.DataMarcada.substring(5, 6);
            const dd = element.DataMarcada.substring(8, 9);
            const hh = element.DataMarcada.substring(11, 12);
            const min = element.DataMarcada.substring(14, 15);
            */
            const year = element.DataMarcada.getFullYear();
            const mm = element.DataMarcada.getMonth()+1;
            const dd = element.DataMarcada.getDate();
            const hh = element.DataMarcada.getHours();
            let min = element.DataMarcada.getMinutes();
            if (min == 0 ) {
              min = "00";
            }
            const dataMarcada = dd + "/" + mm + "/" +
              year + "  " + hh + ":" + min;
            element.DataMarcada = dataMarcada;
            ref.push(element);
          });
          // ref.set(true);
          return null;
        });
      } catch (err) {
        // ... error checks
        console.log("Erro try: " + JSON.stringify(err));
      }
    });

exports.pesquisaSatisfacaoRDHZApi =
    functions.database.ref("RDH/pesquisaSatisfacao/aEnviar/{pushId}")
        .onWrite((change, context) => {
          // Only edit data when it is first created.
          // if (change.before.exists()) {
          // return null;
          // }
          // Exit when the data is deleted.
          if (!change.after.exists()) {
            return null;
          }
          const db = admin.database();
          // Grab the current value of what was written to the Realtime Database
          const element = change.after.val();
          console.log("element:"+JSON.stringify(element));
          // const endereco = "Praça Saenz Pena 45, sala 1508";
          // console.log("forEach. element:" + JSON.stringify(element));
          let paciente = "";
          let dataMarcada = "";
          let idCirurgiao = "";
          // let medico = "";
          // let convenio = "";
          /*
          if (element.Medico) {
            medico = element.Medico;
          }
          */
          if (element.Paciente) {
            paciente = element.Paciente;
          }
          if (element.DataMarcada) {
            dataMarcada = element.DataMarcada;
          }
          if (element.IDCirurgiao) {
            idCirurgiao = element.IDCirurgiao;
          }
          /*
          if (element.Convenio) {
            convenio = element.Convenio;
          }
          */
          let whatsAppCel = "";
          if (element.TelefoneCom) {
            whatsAppCel = tel2Whats(element.TelefoneCom);
          }
          if (element.TelefoneCel) {
            whatsAppCel = tel2Whats(element.TelefoneCel);
          }
          if (element.TelefoneRes) {
            whatsAppCel = tel2Whats(element.TelefoneRes);
          }
          if (element.Telefone) {
            whatsAppCel = tel2Whats(element.Telefone);
          }
          // console.log("whatsAppCel: " + whatsAppCel);
          if (whatsAppCel != "") {
            // dd/mm/yyyy hh:mm
            const year = dataMarcada.split("/")[2].split(" ")[0];
            const mm = dataMarcada.split("/")[1];
            const dd = dataMarcada.split("/")[0];
            // const hh = dataMarcada.substring(9, 10);
            // const min = dataMarcada.substring(12, 13);
            let message1 = "";
            let link = "";
            const idMedicoPath = db.ref("RDH/pesquisaSatisfacao/"+
              "configuracoes/medicos/"+idCirurgiao);
            idMedicoPath.once("value").then((snapshot) => {
              console.log("idMedicoPath: "+JSON.stringify(snapshot));
              // if (snapshot.val()) {
              // // if ((snapshot.val())&&(idCirurgiao==snapshot.key)) {
              //   // se nao encontrar link, link = "vazio"
              //   // link deve ser obtido do realtime database
              //   link = snapshot.val().link;
              //   message1 = "Olá! Aqui é da Rio Day." +
              //   "\n\nObrigado por nos escolher para a cirurgia de " +
              //   paciente + "." +
              //   "\n\nPara que possamos melhorar ainda mais, clique " +
              //   "no link e responda anonimamente a apenas 3 perguntas. " +
              //   "(leva em média 1 minuto). " +
              //   "\n\n https://search.google.com/local/" +
              //   "writereview?placeid=ChIJXabLZBR-mQARKQFQncwkHI8&source=" +
              //   "g.page.m.ia._&laa=nmx-review-solicitation-ia2 " + link +
              //   "\n\n Ao final da pesquisa preparamos uma " +
              //    "*SURPRESA* para você."+
              //   " Confira!" +
              //   "\n\nObrigado e até a próxima!";
              // } else {
              link = "";
              message1 = "Olá! Aqui é do Rio Day Hospital." +
                "\n\nObrigado por nos escolher para a cirurgia de " +
                paciente + "." +
                "\n\nPara que possamos melhorar ainda mais, por favor clique " +
                "no link, avalie-nos no Google e deixe um comentário " +
                "(leva em média 1 minuto). " +
                "\n\nSua opinião é muito importante para nós! " +
                "\n\nhttps://search.google.com/local/" +
                "writereview?placeid=ChIJXabLZBR-mQARKQFQncwkHI8&source=" +
                "g.page.m.ia._&laa=nmx-review-solicitation-ia2 " + link +
                "\n\nObrigado e até a próxima!";
              // }
              // console.log(message1);
              // Z-API
              // console.log("Vai executar XMLHttpRequest.");
              const postData = JSON.stringify({
                "phone": whatsAppCel,
                "message": message1,
              });
              console.log("postData: "+JSON.stringify(postData));
              const req = new XMLHttpRequest();
              const urlZapi = "https://api.z-api.io/instances/" +
              "3A86AB874F03509BE904C23DAB4C141D/token/" +
              "A1B7FC0CB9F9105A8975556F/send-text";
              req.open("POST", urlZapi, true);
              req.setRequestHeader("Content-Type", "application/json");
              req.setRequestHeader("Client-Token",
                  "Fe948ba6a317942849b010c88cd9e6105S");
              /*
              req.onreadystatechange = () => {
                console.log("Entrou readyState: " + req.readyState);
              };
              */
              req.onerror = () => {
                console.log("Entrou onerror: " + req.statusText);
              };
              req.onload = () => {
                console.log("Entrou onload.sta" +req.status+ " " +whatsAppCel);
                if (req.status == 200) {
                  console.log("Z-API chamado com sucesso: " + whatsAppCel);
                  let refEnviados = db.ref("RDH/pesquisaSatisfacao/enviados");
                  // console.log(dataMarcada);
                  // console.log(year+"/"+mm+"/"+dd);
                  refEnviados = refEnviados.child(year+"/"+mm+"/"+dd);
                  refEnviados.push(element);
                  const pushID = context.params.pushId;
                  const refAEnviar = db.ref("RDH/pesquisaSatisfacao/aEnviar/" +
                      pushID);
                  refAEnviar.set(null);
                } else {
                  console.log("Erro chamando Z-API.");
                }
              };
              // setTimeout(function() {
              // req.send(postData);
              // }, 500);
              req.send(postData);
              console.log("req.send(postData): " + postData);
            });
          }
          // You must return a Promise when performing
          // asynchronous tasks inside a Functions such as
          // writing to the Firebase Realtime Database.
          // Setting an "uppercase" sibling
          // in the Realtime Database returns a Promise.
          return null;
        });

// executada com sucesso
// exports.buscaAtivaRDHCargaMensal =
//    functions.https.onRequest((req, resp) => {
exports.buscaAtivaRDHCargaMensal = functions.pubsub
    .schedule("58 16 6 * 1-5")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou buscaAtivaRDHCargaMensal");
      // console.log("req: " + JSON.stringify(req));
      return sqlConnection.connect(sqlConfig).then((pool) => {
        const dbRef = admin.database();
        let queryBuscaAtiva = "";
        queryBuscaAtiva = "SELECT * FROM dbo.vw_Excel_Sis_Atendimento";
        queryBuscaAtiva = queryBuscaAtiva + "_Busca_Ativa_RDH";
        return pool.request().query(queryBuscaAtiva, (err, result) => {
          let codPac = "";
          let strPar = "{";
          result.recordset.forEach((element) => {
            if (element.CodPaciente && element.Telefone &&
              tel2Whats(element.Telefone)) {
              codPac = JSON.stringify("codPac_"+element.CodPaciente+"_"+
                tel2Whats(element.Telefone));
              strPar += codPac+":"+JSON.stringify(element)+",";
            }
          });
          strPar = strPar.slice(0, -1) + "}";
          // console.log(strPar);
          const buscaAtivaJson = JSON.parse(strPar);
          dbRef.ref("RDH/buscaAtiva/pacientesCompleto")
              .set(buscaAtivaJson);
          // resp.end("Ok"+resp.status.toString());
          return null;
        });
      });
    });


// exports.buscaAtivaRDH = functions.https.onRequest((req, resp) => {
exports.buscaAtivaRDH = functions.pubsub
    .schedule("36 17 * * 1-5")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou Função buscaAtivaRDH");
      const promises = [];
      let dataEnvio;
      let dia;
      let mes;
      let ano;
      let sendDate;
      const today = new Date();
      const todayDate = today.getDate()+"/"+(today.getMonth()+1)+"/"+
        today.getFullYear();
      const db = admin.database();
      db.ref("RDH/buscaAtiva/aEnviarOnWrite").set(true);
      console.log("Entrou connect");
      promises.push(db.ref("RDH/buscaAtiva/pacientesCompleto/")
          .once("value"));
      promises.push(db.ref("RDH/buscaAtiva/enviados/").once("value"));
      promises.push(db.ref(
          "RDH/buscaAtiva/cancelados/"+
          "1qzC1RBQ0X-rlKqg_N6-qnEpvx65FuES7ZUfF3ygIj8I/"+
          "Cancelados").once("value"));
      promises.push(db.ref(
          "RDH/buscaAtiva/configuracoes/").
          once("value"));
      Promise.all(promises).then((res) => {
        console.log("Entrou Promise.all");
        // Armazenamento leitura dos DB
        const aEnviar = res[0].val();
        let enviados = {};
        if (res[1].val()) {
          enviados = res[1].val();
        } else {
          enviados = {
            codPac_0000213_5521981459182: {
              CodPaciente: "0000213",
              Convenio: "Cassi",
              DataAtendimento: "2018-03-22T14:20:00.000Z",
              DataEnvio: "25/8/2022",
              IDItem: 101,
              Item: "CONSULTA",
              Medico: "Wilson Barros de Moraes Junior ",
              Paciente: "Wilson Matheus Pereira ",
              Telefone: "(21)98145-9182",
            },
          };
        }
        const cancelados = res[2].val();
        const quantidadeEnvio = res[3].val().quantidadeEnvio;
        const zApi = res[3].val().zApi;
        const entriesEnviados = Object.entries(enviados);
        const entriesAEnviar = Object.entries(aEnviar);
        const entriesCancelados = Object.entries(cancelados);
        const enviadosFiltrado = {};
        console.log("Passou entriesEnviados = Object.entries(enviados)");
        // Processamento dos Enviados
        // Remoção de pacientes enviados há mais de 1 mês
        entriesEnviados.forEach((element) => {
          dataEnvio = element[1].DataEnvio;
          mes = dataEnvio.split("/")[1];
          dia = dataEnvio.split("/")[0];
          ano = dataEnvio.split("/")[2];
          sendDate = new Date(mes+"/"+
            dia+"/"+ano);
          sendDate.setDate(sendDate.getDate()+30);
          if (sendDate>today) {
            enviadosFiltrado[element[0]] = element[1];
          }
        });
        console.log("Passou For Each Enviados");

        // Filtrando a Enviar
        const entriesEnviadosFiltrados = Object.entries(enviadosFiltrado);
        let count = 0;
        let countLidos = 0;
        let countEnviados = 0;
        let countCancelados = 0;

        // Lê entriesAEnviar do fim pro inicio
        entriesAEnviar.slice().reverse().forEach((pacAEnviar)=>{
          countLidos+=1;
          if (count<quantidadeEnvio) {
            if (entriesEnviadosFiltrados.some((pacEnviado) =>
              pacEnviado[1].CodPaciente==pacAEnviar[1].CodPaciente)) {
              countEnviados+=1;
            } else if (entriesCancelados.some((pacCancelado) =>
              tel2Whats(pacCancelado[1].WhatsApp.toString())==
              tel2Whats(pacAEnviar[1].Telefone))) {
              countCancelados+=1;
            } else {
            // Escreve no nó aEnviarOnWrite
              /*
              let paciente = "";
              if (pacAEnviar[1].Paciente) {
                paciente = pacAEnviar[1].Paciente;
              }
              */
              let dataCirurgia = "";
              if (pacAEnviar[1].DataAtendimento) {
                dataCirurgia = pacAEnviar[1].DataAtendimento;
                ano = dataCirurgia.substring(0, 4);
                mes = dataCirurgia.substring(5, 7);
                dia = dataCirurgia.substring(8, 10);
                dataCirurgia = dia+"/"+mes+"/"+ano;
              }
              /*
              let medico = "";
              if (pacAEnviar[1].Medico) {
                medico = pacAEnviar[1].Medico;
              }
              */
              let whatsAppCel;
              if (pacAEnviar[1].Telefone) {
                whatsAppCel = tel2Whats(pacAEnviar[1].Telefone);
              }
              let postData = {};
              if (whatsAppCel) {
                const message = "2 novidades CPA + Rio Day Hospital " +
                "para o Natal!" +
                "\n\n1 - A CPA adquiriu um moderno aparelho de Laser " +
                "que traz " +
                "resultados incríveis para rejuvenescimento facial, " +
                "pálpebras, " +
                "região íntima e cicatrizes. Pacientes CPA terão um CUPOM de " +
                "20% para utilizar em dezembro." +
                "\n\n2 - O número (21)98263-2650 foi desviado e deverá ser " +
                "EXCLUÍDO de seus contatos." +
                "\n\nAgende seu CUPOM CPA20 pelo Whats (21)99993-9939" +
                "\n\nCaso não queira mais receber mensagens, basta digitar " +
                "CANCELAR.";

                // Z-API
                postData = {
                  phone: whatsAppCel,
                  message: message,
                  idInstancia: zApi.idInstancia,
                  tokenInstancia: zApi.tokenInstancia,
                };
              }
              db.ref("RDH/buscaAtiva/aEnviarOnWrite").
                  push(postData);
              pacAEnviar[1].DataEnvio = todayDate;
              enviadosFiltrado[pacAEnviar[0]] = pacAEnviar[1];
              count+=1;
            }
          }
        });
        console.log("Cancelados: " + countCancelados);
        console.log("Ja enviados no ultimo mes: " + countEnviados);
        console.log("Lidos: " + countLidos);
        console.log("Enviados com sucesso: " + count);
        db.ref("RDH/buscaAtiva/enviados").
            set(enviadosFiltrado);
        // resp.end("Ok"+resp.status.toString());
        return null;
      });
    });

exports.buscaAtivaRDHZApi =
    functions.database.ref("/RDH/buscaAtiva/aEnviarOnWrite/{pushId}")
        .onWrite((change, context) => {
          console.log("Entrou buscaAtivaRDHZApi");
          if (!change.after.exists()) {
            return null;
          }
          // Grab the current value of what was written to the Realtime Database
          const element = change.after.val();

          let whatsAppCel;
          if (element.phone) {
            whatsAppCel = element.phone;
          }
          let idInstancia;
          if (element.idInstancia) {
            idInstancia = element.idInstancia;
          }
          let tokenInstancia;
          if (element.tokenInstancia) {
            tokenInstancia = element.tokenInstancia;
          }
          let message;
          if (element.message) {
            message = element.message;
          }
          if (ambiente == "teste") whatsAppCel = "5521971938840";

          if (whatsAppCel) {
            const parametros = {
              whatsAppCel: whatsAppCel,
              id: idInstancia,
              token: tokenInstancia,
            };
            const message1 = message;

            const arrUrls = [message1];
            const arrMessageType = ["text"];
            const i = 0;
            callZapiV2(arrUrls, arrMessageType, parametros, i);
          }
          return null;
        });

exports.webTest = functions.https.onRequest((req, resp) => {
  cors(req, resp, () => {
    console.log("Entrou webTest");
    const busboyConst = busboy({headers: req.headers});
    const fields = {};
    const db = admin.database();


    // This code will process each non-file field in the form.
    busboyConst.on("field", (fieldname, val) => {
      /**
       *  TODO(developer): Process submitted field values here
       */
      console.log("Processed field " + fieldname +":" + val);
      fields[fieldname] = val;
    });
    busboyConst.on("close", () => {
      console.log("fields: " + JSON.stringify(fields));
      if (fields.empresa == "OFT") {
        fields.empresa = "OFT/45";
      }
      const emp = fields.empresa;
      db.ref(emp + "/leads/_dadosComuns/dadosPagina/" + fields.pagina)
          .once("value")
          .then((snapshot) => {
            if (snapshot.exists()) {
              console.log("Entrou Get");
              console.log(snapshot.val());

              fields.telefone = tel2Whats(fields.telefone);
              db.ref(fields.empresa + "/leads/" + fields.pagina).push(fields);
              // resp.end(JSON.stringify(fields));
              const msgEncoded = encodeURIComponent(snapshot.val().mensagem);
              // resp.redirect(301, "https://api.whatsapp.com/send?phone=" +

              // const date = new Date();
              // const currentYear = date.getFullYear();
              // const today = date.getDate();
              // const currentMonth = date.getMonth() + 1;
              // const hora = date.getHours();
              // const minutos = date.getMinutes();
              // const segundos = date.getSeconds();

              let enderecoUrl = "";
              if (fields.empresa == "OFT/45") enderecoUrl = "https://oftalmoday.com.br";
              if (fields.empresa == "RDH") enderecoUrl = "https://riodayhospital.net.br";


              const moment = require("moment-timezone");
              const horaAtual = moment()
                  .tz("America/Sao_Paulo").format("HH:mm:ss");
              const dataAtual = moment()
                  .tz("America/Sao_Paulo").format("DD/MM/YYYY");

              const mailOptions = {
                from: "oftautomacao@hotmail.com",
                to: "oftautomacao@gmail.com",
                subject: "Nova mensagem de "+ fields.pagina, // assunto do email
                text: "Nome: " + fields.nome + //               texto do email
                      "\nTelefone: " + fields.telefone +
                "\n\nDate: " + dataAtual +
                "\nTime: " + horaAtual +
                "\nPage URL: " + enderecoUrl + "/" + fields.pagina + "/",
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Email sent: " + info.response);
                }
              });


              resp.redirect(301, "https://wa.me/" +
                snapshot.val().telefone + "?text=" + msgEncoded);
            } else {
              console.log("No data available");
            }
          }).catch((error) => {
            console.error(error);
          });
    });
    busboyConst.end(req.rawBody);
  });
});


// /**
//  * @param {int} cb bla bla bla.
//  */
// function openInboxCatarata(cb) {
//   imapCatarata.openBox("INBOX", true, cb);
// }
// // exports.buscaAtivaCatarataCargaMensal = functions.pubsub
// //     .schedule("31 17 19 * *")
// //     .timeZone("America/Sao_Paulo") // Users can choose timezone
// //     .onRun((context) => {

// exports.buscaAtivaCatarataCargaMensal = functions.https
//     .onRequest((req, resp) => {
//       console.log("Entrou buscaAtivaCatarataCargaMensal");
//       let arrPacientes = [];
//       const db = admin.database();
//       let count = 0;
//       const arrPromises = [];
//       arrPromises.push(db
//           .ref("OFT/45/catarata/buscaAtivaCatarata/"+
//           "configuracoes/")
//           .once("value"));
//       arrPromises.push(db.ref(
//           "/OFT/45/catarata/buscaAtivaCatarata/pacientesCompleto")
//           .once("value"));
//       return Promise.all(arrPromises).then((res) => {
//         console.log("Entrou Promise");
//         const configuracoes = res[0].val();
//         if (res[1].val()) {
//           arrPacientes = res[1].val();
//         }
//         imapCatarata.once("ready", () => {
//           openInboxCatarata((err, box) => {
//             if (err) throw err;

//             const dataInicio = configuracoes.dataInicio;
//             const dataFim = configuracoes.dataFim;

//             const criteria = ["UNSEEN", ["SINCE", dataInicio],
//               ["BEFORE", dataFim],
//               ["FROM", "formulario@maisresultado.net.br"],
//               ["SUBJECT", "Catarata Agora"]];
//             imapCatarata.search(criteria, (err3, results) => {
//               if (err3) {
//                 console.error("FAILED TO SEARCH IMAP", err3);
//               } else if (results.length > 0) {
//                 // const inicioFetch = box.messages.total-30;
//                 // const fimFetch = box.messages.total;
//                 // const f = imap.fetch(inicioFetch + ":" + fimFetch,
//                 //   {bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)",
//                 // "TEXT"]});
//                 const f = imapCatarata.fetch(results,
//                     {bodies: ["HEADER.FIELDS (SUBJECT)", "TEXT"]});
//                 // {bodies: ["HEADER.FIELDS (FROM SUBJECT DATE)",
//                 // "TEXT"]});
//                 f.on("message", (msg, seqno) => {
//                   // console.log("Message #%d", seqno);
//                   // const prefix = "(#" + seqno + ") ";
//                   msg.on("body", (stream, info) => {
//                     if (info.which === "TEXT") {
//                       // console.log(prefix + "Body [%s] found,
//                       // %d total bytes",
//                       //    inspect(info.which), info.size);
//                     }
//                     let buffer = "";
//                     // let count = 0;
//                     stream.on("data", (chunk) => {
//                       // count += chunk.length;
//                       buffer += chunk.toString("utf8");
//                       if (info.which === "TEXT") {
//                         // console.log(prefix + "Body [%s] (%d/%d)",
//                         //    inspect(info.which), count, info.size);
//                       }
//                     });
//                     stream.once("end", () => {
//                       if (info.which !== "TEXT") {
//                         // const parsedHeader = Imap.parseHeader(buffer);

//                         // data da mensagem
//                         // console.log(parsedHeader.date);
//                       } else {
//                         // console.log(buffer);

//                         const arrLinhas = buffer.split("<br>");

//                         const nomePaciente = arrLinhas[0];
//                         let telefonePaciente = arrLinhas[1];

//                         // console.log("------> "+ arrLinhas[0]);
//                         // console.log("------> "+ arrLinhas[1]);
//                         telefonePaciente = tel2Whats(telefonePaciente);
//                         telefonePaciente = telefonePaciente.substring(2);

//                         // Incluir no JSON
//                         if (telefonePaciente != "") {
//                           arrPacientes[telefonePaciente] = {
//                             nome: nomePaciente,
//                             telefone: telefonePaciente,
//                           };
//                           count += 1;
//                         }
//                       }
//                     });
//                   });

//                   msg.once("end", () => {
//                     // console.log(prefix +
//                     // "------------------------------------------------");
//                   });
//                 });
//                 f.once("error", (err) => {
//                   console.log("Fetch error: " + err);
//                 });
//                 f.once("end", () => {
//                   console.log("Done fetching all " + count + " messages!");

//                   // Escrever arrPacientes no Realtime Database
//                   db.ref("/OFT/45/catarata/buscaAtivaCatarata/"+
//                       "pacientesCompleto")
//                       .set(arrPacientes);

//                   imapCatarata.end();
//                   resp.end("Ok"+resp.status.toString());
//                   // resp.end(arrPacientes);
//                 });
//               }
//             });
//           });
//         });
//         imapCatarata.once("error", (err) => {
//           console.log(err);
//           resp.end("imapCatarata error"+resp.status.toString());
//         });

//         imapCatarata.once("end", () => {
//           console.log("Connection ended");
//           resp.end("Ok"+resp.status.toString());
//         });
//         imapCatarata.connect();
//       });
//     });

// exports.buscaAtivaCatarata = functions.pubsub
//     .schedule("00 13 * * 1-5")
//     .timeZone("America/Sao_Paulo") // Users can choose timezone
//     .onRun((context) => {
//

// exports.buscaAtivaCatarata = functions.https.
//     onRequest((req, resp) => {
//       console.log("Entrou buscaAtivaCatarata");

//       const promises = [];
//       let monthEnvio;
//       let dayEnvio;
//       let dataEnvio;
//       let yearEnvio;
//       let sendDate;
//       const today = new Date();
//       const todayDate = today.getDate()+"/"+(today.getMonth()+1)+"/"+
//       today.getFullYear();
//       const db = admin.database();
//       db.ref("OFT/45/catarata/buscaAtivaCatarata/aEnviarOnWrite").set(true);

//       try {
//         // return sqlConnection.connect(sqlConfig).then((pool) => {
//         console.log("Entrou connect");
//         // let queryAgendados = "";
//         // queryAgendados = "SELECT CodPaciente, Paciente, Convenio, ";
//         // queryAgendados = queryAgendados + "Medico ";
//         // queryAgendados = queryAgendados + "FROM dbo.vw_Excel_";
//         // queryAgendados = queryAgendados +"Age_Marcacao";
//         // queryAgendados = queryAgendados + "_Pacientes_Agendados ";
//         // queryAgendados = queryAgendados +"WHERE CodPaciente ";
//         // queryAgendados = queryAgendados +"IS NOT NULL";

//         // let queryUltimoAno = "";
//         // queryUltimoAno = "SELECT CodPaciente, Paciente, Convenio, ";
//         // queryUltimoAno = queryUltimoAno + "Medico, Telefone, ";
//         // queryUltimoAno = queryUltimoAno + "IDItem, Item ";
//         // queryUltimoAno = queryUltimoAno + "FROM dbo.vw_Excel";
//         // queryUltimoAno = queryUltimoAno + "_Sis_Atendimento";
//         // queryUltimoAno = queryUltimoAno + "_Pacientes_Ult_Ano_45";
//         // queryUltimoAno = queryUltimoAno + " WHERE CodPaciente ";
//         // queryUltimoAno = queryUltimoAno + "IS NOT NULL";

//         // const queries = queryAgendados + ";" +
//         // queryUltimoAno;
//         // console.log("queries: " + queries);
//         // promises.push(pool.request().query(queries));
//         promises.push(db
//             .ref("OFT/45/catarata/buscaAtivaCatarata/pacientesCompleto/")
//             .once("value"));
//         promises.push(db
//             .ref("OFT/45/catarata/buscaAtivaCatarata/enviados/")
//             .once("value"));
//         promises.push(db
//             .ref("OFT/45/catarata/buscaAtivaCatarata/cancelados")
//             .once("value"));
//         promises.push(db.ref(
//             "OFT/45/catarata/buscaAtivaCatarata/"+
//             "configuracoes/quantidadeEnvio/")
//             .once("value"));
//         return Promise.all(promises).then((res) => {
//           console.log("Entrou Promise");
//           // console.log("Res: "+JSON.stringify(res));
//           // Armazenamento leitura dos DB
//           // const agendados = res[0].recordsets[0];
//           // const ultimoAno = res[0].recordsets[1];
//           const aEnviar = res[0].val();
//           console.log("aEnviar: " + JSON.stringify(aEnviar));
//           const enviados = res[1].val();
//           const cancelados = res[2].val();
//           const quantidadeEnvio = res[3].val();
//           // Processamento dos Enviados
//           // Remoção de pacientes enviados há mais de 1 mês
//           const entriesEnviados = Object.entries(enviados);
//           const entriesAEnviar = Object.entries(aEnviar);
//           // const entriesCancelados = Object.entries(cancelados);
//           const enviadosFiltrado = {};
//           let countEnviadosFiltrado = 0;

//           // Retirar enviados há mais de um mês
//           entriesEnviados.forEach((element) => {
//             dataEnvio = element[1].DataEnvio;
//             monthEnvio = dataEnvio.split("/")[1];
//             dayEnvio = dataEnvio.split("/")[0];
//             yearEnvio = dataEnvio.split("/")[2];
//             sendDate = new Date(monthEnvio+"/"+
//               dayEnvio+"/"+yearEnvio);
//             sendDate.setDate(sendDate.getDate()+30);
//             if (sendDate>today) {
//               countEnviadosFiltrado+=1;
//               enviadosFiltrado[element[0]] = element[1];
//             }
//           });
//           console.log("Passou For Each Enviados");

//           // Filtrando a Enviar
//           const entriesEnviadosFiltrados = Object.entries(enviadosFiltrado);
//           let count = 0;
//           let countLidos = 0;
//           // let countAgendados = 0;
//           // let countUltimoAno = 0;
//           let countEnviados = 0;
//           let countCancelados = 0;

//           const dataAtualAux = new Date();
//           const dataAtual = JSON.stringify(dataAtualAux);

//           // console.log("cancelados: " + JSON.stringify(cancelados));
//           // Lê entriesAEnviar do fim pro inicio
//           // entriesAEnviar.slice().reverse().forEach((pacAEnviar)=>{
//           entriesAEnviar.forEach((pacAEnviar)=>{
//             console.log("pacAEnviar"+JSON.stringify(pacAEnviar));
//             countLidos+=1;
//             if (count<quantidadeEnvio) {
//               // agendados
//               // if (agendados.some((pacAgendado) =>
//               //   pacAgendado.CodPaciente==pacAEnviar[1].CodPaciente)) {
//               //   countAgendados+=1;

//               // // ultimo ano
//               // } else
//               // if (ultimoAno.some((pacUltimoAno) =>
//               //   pacUltimoAno.CodPaciente==pacAEnviar[1].CodPaciente)) {
//               //   countUltimoAno+=1;

//               // // enviados
//               // } else
//               if (entriesEnviadosFiltrados.some((pacEnviado) =>
//                 pacEnviado[1].telefone==pacAEnviar[1].telefone)) {
//                 countEnviados+=1;
//                 // console.log("ja enviado " + pacAEnviar[1].Paciente);

//               // cancelados
//               } else {
//                 let cancelou = false;
//                 console.log("pacAEnviar[1].telefone: "+
//                     pacAEnviar[1].telefone);
//                 const whatsApp = tel2Whats(pacAEnviar[1].telefone)
//                     .substring(2, 13);
//                 if (cancelados[whatsApp]) {
//                   const pacCanc = cancelados[whatsApp];
//                   if ((pacCanc.Reenviar.toString() == "") ||
//                     (JSON.stringify(pacCanc.Reenviar) > dataAtual)) {
//                     cancelou = true;
//                   } else {
//                     db.ref("OFT/45/catarata/" +
//                     "buscaAtivaCatarata/cancelados/" +
//                     whatsApp).set(null);
//                   }
//                 }
//                 if (cancelou) {
//                   countCancelados+=1;

//                 // enviar
//                 } else {
//                   // console.log("enviou " + pacAEnviar[1].Paciente);
//                db.ref("OFT/45/catarata/buscaAtivaCatarata/aEnviarOnWrite").
//                       push(pacAEnviar[1]);
//                   pacAEnviar[1].DataEnvio = todayDate;
//                   enviadosFiltrado[pacAEnviar[0]] = pacAEnviar[1];
//                   count+=1;
//                 }
//               }
//             }
//           });
//           console.log("Cancelados: " + countCancelados);
//           console.log("Ja enviados no ultimo mes: " + countEnviados);
//           // console.log("Ultimo Ano: " + countUltimoAno);
//           // console.log("Agendados: " + countAgendados);
//           console.log("Enviados Filtrado: " + countEnviadosFiltrado);
//           console.log("Lidos: " + countLidos);
//           console.log("Enviados com sucesso: " + count);
//           if (ambiente === "producao") {
//             db.ref("OFT/45/catarata/buscaAtivaCatarata/enviados").
//                 set(enviadosFiltrado);
//           }
//           resp.end("Ok"+resp.status.toString());
//           // return null;
//         });
//         // });
//       } catch (err) {
//         // ... error checks
//         console.log("Erro try: " + JSON.stringify(err));
//       }
//     });

// exports.buscaAtivaCatarataZApi =
//     functions.database
//         .ref("/OFT/45/catarata/buscaAtivaCatarata/aEnviarOnWrite/{pushId}")
//         .onWrite((change, context) => {
//           console.log("Entrou buscaAtivaCatarataZApi");
//           // Only edit data when it is first created.
//           // if (change.before.exists()) {
//           // return null;
//           // }
//           // Exit when the data is deleted.
//           if (!change.after.exists()) {
//             return null;
//           }
//           console.log("change: " + JSON.stringify(change));
//           // const db = admin.database();
//        // Grab the current value of what was written to the Realtime Database
//           const element = change.after.val();
//           console.log(JSON.stringify(element));
//           let paciente = "";
//           if (element.nome) {
//             paciente = element.nome;
//           }
//           console.log("paciente: "+ paciente);
//           let whatsAppCel;
//           if (element.telefone) {
//             whatsAppCel = tel2Whats(element.telefone);
//           }

//           if (ambiente == "teste") whatsAppCel = "5521971938840";
//           let message1;
//           if (whatsAppCel) {
//             message1 = "Olá "+ paciente + "!\n" +
//             "Aqui é a Denise da Oftalmo Day Dr Antonio Lobo. " +
//             "Você entrou em contato conosco há algum tempo " +
//             "atrás através do nosso site Catarata Agora. " +
//             "\n\nÉ muito importante não deixar sua catarata ficar " +
//             "madura e consequentemente dificultar sua extração. "+
//             "\n\nPortanto, caso ainda não tenha realizado " +
//             "sua cirurgia, gostaria de agendar uma " +
//             "consulta?";
//             if (ambiente == "teste") {
//               message1 = whatsAppCel + message1;
//             }

//             // Z-API
//             const postData = JSON.stringify({
//               "phone": whatsAppCel,
//               "message": message1,
//               "buttonList": {
//                 "buttons": [
//                   {
//                     "id": "BSCATVCTRT-AGDCONS",
//                     "label": "Agendar consulta",
//                   },
//                   {
//                     "id": "BSCATVCTRT-LMBRFUT",
//                     "label": "Lembre-me novamente no futuro",
//                   },
//                   {
//                     "id": "BSCATVCTRT-CANCMSG",
//                     "label": "Não quero mais receber mensagem",
//                   },
//                 ],
//               },
//             });

//             if (ambiente == "teste" & testeCelularZApi == "on") {
//               const chamarFunctionMsgReceb = "run";
//               celularZApi(postData, chamarFunctionMsgReceb);
//             } else {
//               const req = new XMLHttpRequest();
//               let urlZapi = "";
//               if (ambiente == "teste") {
//                 // RDH
//                 urlZapi = "https://api.z-api.io/instances/" +
//                 "3B74CE9AFF0D20904A9E9E548CC778EF/token/" +
//                 "A8F754F1402CAE3625D5D578/send-text";
//               } else {
//                 // 45
//                 urlZapi = "https://api.z-api.io/instances/" +
//                 "39C7A89881E470CC246252059E828D91/token/" +
//                 "B1CA83DE10E84496AECE8028/send-text";
//               }
//               req.open("POST", urlZapi, true);
//               req.setRequestHeader("Content-Type", "application/json");
//               req.onerror = () => {
//                 console.log("Entrou onerror: " + req.statusText);
//               };
//               req.onload = () => {
//                 console.log("Entrou onload. req.status: " + req.status);
//                 if (req.status == 200) {
//                   console.log("Z-API chamado com sucesso: " + whatsAppCel);
//                 } else {
//                   console.log("Erro chamando Z-API.");
//                 }
//               };
//               req.send(postData);
//               console.log("req.send(postData): " + postData);
//             }
//           }
//           return null;
//         });


// /**
//  * @param {int} cb bla bla bla.
//  */
// function openInboxHernia(cb) {
//   imap.openBox("INBOX", true, cb);
// }

// exports.buscaAtivaHernia = functions.https.onRequest((req, resp) => {
//   console.log("Entrou buscaAtivaHernia");
//   const arrPacientes = [];
//   const db = admin.database();
//   let count = 0;
//   db.ref("/RDH/hernia/buscaAtivaHernia/cancelados/" +
//     "1G28bO9HFHLP3fivSCh3tqTZ7NKxmKG28vZtrhCdRBIk/Cancelados").once("value")
//       .then((snapshotCancelados) => {
//         const cancelados = snapshotCancelados.val();
//         // console.log("cancelados: " + JSON.stringify(cancelados));
//         imap.once("ready", () => {
//           console.log("Entrou imap.once");
//           openInboxHernia((err, box) => {
//             console.log("Entrou openInboxHernia");
//             if (err) throw err;
//             // const criteria = ["UNSEEN", ["SINCE", "Jan 1, 2022"],
//             //   ["BEFORE", "Feb 28, 2022"],
//             const criteria = ["UNSEEN", ["SINCE", "Jan 1, 2022"],
//               ["BEFORE", "Feb 28, 2022"],
//               ["FROM", "site@riodayhospital.com.br"], ["BODY", "Hérnia"]];
//             imap.search(criteria, (err3, results) => {
//               console.log("Entrou imap.search");
//               if (err3) {
//                 console.log("Entrou if (err3)");
//                 console.error("FAILED TO SEARCH IMAP", err3);
//               } else if (results.length > 0) {
//                 console.log("Entrou if (results.length > 0)");
//                 const f = imap.fetch(results,
//                     {bodies: ["HEADER.FIELDS (FROM SUBJECT DATE)", "TEXT"]});
//                 f.on("message", (msg, seqno) => {
//                   console.log("Entrou f.on(message)");
//                   const prefix = "(#" + seqno + ") ";
//                   msg.on("body", (stream, info) => {
//                     let buffer = "";
//                     stream.on("data", (chunk) => {
//                       buffer += chunk.toString("utf8");
//                     });
//                     stream.once("end", () => {
//                       if (info.which !== "TEXT") {
//                         const parsedHeader = Imap.parseHeader(buffer);
//                         // data da mensagem
//                         console.log(parsedHeader.date);
//                       } else {
//                         console.log(buffer);
//                         const arrLinhas = buffer.split(/\r?\n/);
//                         let nomePaciente = "";
//                         let telefonePaciente = "";
//                         arrLinhas.forEach((element) => {
//                           if (element.indexOf("Nome:") != -1) {
//                             nomePaciente = element.substring(6);
//                           }
//                           if (element.indexOf("Telefone:") != -1) {
//                          telefonePaciente = tel2Whats(element.substring(10));
//                             telefonePaciente = telefonePaciente.substring(2);
//                           }
//                         });
//                         if ((telefonePaciente != "") &&
//                           (!cancelados[telefonePaciente])) {
//                           // Incluir no JSON
//                           count+=1;
//                           arrPacientes[telefonePaciente] = {
//                             nome: nomePaciente,
//                             telefone: telefonePaciente,
//                           };
//                         }
//                       }
//                     });
//                   });
//                   msg.once("end", () => {
//                     console.log(prefix +
//                      "---------------------------------------------------");
//                   });
//                 });
//                 f.once("error", (err) => {
//                   console.log("Fetch error: " + err);
//                 });
//                 f.once("end", () => {
//                   console.log("Done fetching all messages!");
//                   console.log("Enviados: " + count);
//                   // Escrever arrPacientes no Realtime Database
//                   if (ambiente == "teste") {
//                     db.ref("RDH/hernia/buscaAtivaHernia/aEnviarOnWrite")
//                         .set(arrPacientes);
//                   } else {
//                     db.ref("RDH/hernia/buscaAtivaHernia/aEnviarOnWrite")
//                         .set(arrPacientes);
//                   }
//                   imap.end();
//                   resp.end("Ok"+resp.status.toString());
//                   // resp.end(arrPacientes);
//                 });
//               }
//             });
//           });
//         });
//         imap.once("error", (err) => {
//           console.log(err);
//           resp.end("imap error"+resp.status.toString());
//         });
//         imap.once("end", () => {
//           console.log("Connection ended");
//           resp.end("Ok"+resp.status.toString());
//         });
//         imap.connect();
//       });
// });


// exports.buscaAtivaHerniaZApi =
//     functions.database
//         .ref("RDH/hernia/buscaAtivaHernia/aEnviarOnWrite/{pushId}")
//         .onWrite((change, context) => {
//           console.log("Entrou buscaAtivaHerniaZApi");
//           if (!change.after.exists()) {
//             return null;
//           }
//           // const db = admin.database();
//        // Grab the current value of what was written to the Realtime Database
//           const element = change.after.val();
//           // console.log(JSON.stringify(element));
//           let paciente = "";
//           if (element.nome) {
//             paciente = element.nome;
//           }
//           let whatsAppCel;
//           if (element.telefone) {
//             whatsAppCel = tel2Whats(element.telefone);
//           }

//           if (ambiente == "teste") whatsAppCel = "5521984934862";

//           if (whatsAppCel) {
//             const parametros = {
//               whatsAppCel: whatsAppCel,
//               id: "3A86AB874F03509BE904C23DAB4C141D",
//               token: "A1B7FC0CB9F9105A8975556F",
//             };
//             const message1 = "Olá "+ paciente + "!\n" +
//             "Aqui é a Flávia do Rio Day Hospital. Você entrou em contato " +
//           "conosco há mais de um mês a respeito de cirurgia de hérnia.\n\n" +
//             "Temos a preocupação de não deixar sua hérnia evoluir para " +
//             "uma complicação. Portanto, caso ainda não tenha realizado " +
//             "sua cirurgia, sugerimos fortemente um " +
//             "acompanhamento periódico.\n\nVocê gostaria de solicitar " +
//             "um orçamento prévio e posteriormente agendar uma " +
//             "consulta?" +
//             "\n\nCaso não queira receber mais mensagens, " +
//             "basta responder 'Cancelar'.";


//             const arrUrls = [message1];
//             const arrMessageType = ["text"];
//             const i = 0;
//             callZapiV2(arrUrls, arrMessageType, parametros, i);
//           }
//           return null;
//         });

/*
exports.acionarDialogFlow = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    // Get WhatsApp Message Information
    // const body = request.body;
    // const receivedMsg = body.Body;
    // const userNumber = body.From;
    // const myNumber = request.body.To;
    functions.logger.info("request.body: ", JSON.stringify(request.body));
    let receivedMsg = "";
    if (request.body.text) {
      functions.logger.info("request.body.text" +
        ": ", JSON.stringify(request.body.text));
      receivedMsg = request.body.text.message;
    } else if (request.body.buttonsResponseMessage.message) {
      functions.logger.info("request.body.buttonsResponseMessage.message: ",
          JSON.stringify(request.body.buttonsResponseMessage.message));
      receivedMsg = request.body.buttonsResponseMessage.message;
    }
    const userNumber = request.body.phone;
    if (receivedMsg) {
      // Configure Dialogflow Session
      const sessionPath = sessionClient.sessionPath(projectId, userNumber);
      const reqDF = {
        session: sessionPath,
        queryInput: {
          text: {
            text: receivedMsg,
            languageCode: "pt-BR",
          },
        },
      };
      try {
        functions.logger.info("Vai entrar sessionClient.detectIntent: ");
        sessionClient.detectIntent(reqDF).then((responses) => {
          functions.logger.info("Entrou sessionClient.detectIntent: ");
          functions.logger.info("responses: ", JSON.stringify(responses));
          // Iterate over every message
          for (const fulfillmentMessage of
            responses[0].queryResult.fulfillmentMessages) {
            // Send Text Message
            if (fulfillmentMessage.text) {
              const responseMsg = fulfillmentMessage.text.text[0];
              functions.logger.info("responseMsg: ", responseMsg);
              // Z-API
              const request = new XMLHttpRequest();
              const urlZapi = "https://api.z-api.io/instances/" +
                "39C7A89881E470CC246252059E828D91/token/" +
                "B1CA83DE10E84496AECE8028/send-text";
              request.open("POST", urlZapi, true);
              request.setRequestHeader("Content-Type", "application/json");
              const postData = JSON.stringify({
                "phone": userNumber,
                "message": responseMsg,
              });
              request.send(postData);
              request.onload = () => {
                if (request.status == 200) {
                  functions.logger.info("Z-API chamado com sucesso.");
                } else {
                  functions.logger.info("Erro chamando Z-API.");
                }
              };
            }
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
    response.status(200).send("Sent!");
  });
});

exports.malaDiretaPlasticaJson = functions.https.onRequest((req, resp) => {
  // functions.logger.info("Hello logs!", {structuredData: true});
  cors(req, resp, () => {
    functions.logger.info("Hello logs!", JSON.stringify(req.body));
    const refDbr = admin.database()
        .ref("1BqF0p3MwcbaEYezqY8jRD5b2JM4f2YoClzYxAcyOvTc/Plastica");
    const refDbw = admin.database().ref("malaDiretaAEnviar/Plastica");
    refDbw.set("true");
    refDbr.once("value")
        .then((snapshot) => {
          if (snapshot.exists()) {
            snapshot.val().forEach((element) => {
              refDbw.push(element);
            });
          } else {
            console.log("No data available");
          }
        }).catch((error) => {
          console.error(error);
        });
    // const storageRef = admin.storage().bucket("gs://oftautomacao-9b427.appspot.com/CirurgiaPlastica");
    // const file1 = storageRef.file("CirurgiaPlastica/cirurgia1.jpeg");
    // const storage = firebase.storage().ref();
    // console.log("ref"+JSON.stringify(
    // admin.storage().child("Cirurgia/cirurgia1.jpeg")));
    // const spaceRef = storageRef.child("CirurgiaPlastica/");
  });
});

exports.malaDiretaPlasticaZApi =
    functions.database.ref("malaDiretaAEnviar/Plastica/{pushId}")
        .onWrite((change, context) => {
          // Only edit data when it is first created.
          // if (change.before.exists()) {
          // return null;
          // }
          // Exit when the data is deleted.
          if (!change.after.exists()) {
            return null;
          }
          const element = change.after.val();
          console.log("Lendo Dataset"+JSON.stringify(element.Celular));
          const urlImage1 ="https://firebasestorage.googleapis.com/v0/b/" +
          "oftautomacao-9b427.appspot.com/o/" +
          "CirurgiaPlastica%2Fcirurgia1.jpeg?alt=media&" +
          "token=0f1d3694-cc19-47b9-bf04-763b87a06184";
          const urlImage2 ="https://firebasestorage.googleapis.com/v0/b/" +
          "oftautomacao-9b427.appspot.com/o/" +
          "CirurgiaPlastica%2Fcirurgia2.jpeg?alt=media&" +
          "token=cfd118b3-521a-4402-8fcc-03f400454f37";
          const urlImage3 ="https://firebasestorage.googleapis.com/v0/b/" +
          "oftautomacao-9b427.appspot.com/o/" +
          "CirurgiaPlastica%2Fcirurgia3.jpeg?alt=media&" +
          "token=7d52c737-c109-48fb-8ef1-f1986c360d04";
          const urlImage4 ="https://firebasestorage.googleapis.com/v0/b/" +
          "oftautomacao-9b427.appspot.com/o/" +
          "CirurgiaPlastica%2Fcirurgia4.jpeg?alt=media&" +
          "token=a5688ead-4d79-4296-b468-fe8c38bca8fe";
          const urlImage5 ="https://firebasestorage.googleapis.com/v0/b/" +
          "oftautomacao-9b427.appspot.com/o/" +
          "CirurgiaPlastica%2Fcirurgia5.jpeg?alt=media&" +
          "token=a4cece9a-84a0-4691-a794-4ec551c726b0";
          const urlDoc1 ="https://firebasestorage.googleapis.com/v0/b/" +
          "oftautomacao-9b427.appspot.com/o/" +
          "CirurgiaPlastica%2FTabela%20Cirurgia%20Plastica%202022-1.pdf?" +
          "alt=media&token=59616d31-e7c6-4e66-9850-357b2bee26f7";
          const text1 = "Olá! Meu nome é Alexandre Lobo." +
          " Sou diretor administrativo do Rio Day Hospital," +
          " especializado em cirurgia plástica." +
          " Consegui seu contato na internet. Tudo bem com você?" +
          "\n\nO motivo do meu contato é para convidá-lo a conhecer" +
          " nosso hospital. Ao longo dos últimos 14 anos," +
          " fizemos uma reestruturação completa, tanto em " +
          " infra-estrutura quanto em filosofia de atendimento. " +
          "\n\nE hoje eu posso garantir que aqui" +
          " você e seus pacientes terão uma experiência sem igual no" +
          " Rio de Janeiro com seguranca, conforto e um atendimento" +
          " mais que especial." +
          "\n\nCaso queira saber um pouco mais (inclusive sobre preços" +
          " especiais e parcerias), pode me chamar por aqui mesmo." +
          "\n\nVenha nos visitar. Você vai se surpreender!" +
          "\n\nwww.riodayhospital.com.br" +
          "\nwww.instagram.com/RioDayHospital/";
          const text2 = "Caso não queira receber mais mensagens," +
          " basta responder 'Cancelar'.";
          const arrUrls = [text1, urlImage1, urlImage2, urlImage3,
            urlImage4, urlImage5, urlDoc1, text2];
          const arrMessageType = ["text", "image", "image", "image",
            "image", "image", "document/pdf", "text"];
          const whatsAppCel = "55" + element.Celular;
          // const messageType = "image";
          const i = 0;
          // usar callZapiV2
          callZapi(arrUrls, arrMessageType, whatsAppCel, i);
        });

exports.malaDiretaOftalmoJson = functions.https.onRequest((req, resp) => {
  // functions.logger.info("Hello logs!", {structuredData: true});
  cors(req, resp, () => {
    functions.logger.info("Hello logs!", JSON.stringify(req.body));
    const refDbr = admin.database()
        .ref("1BqF0p3MwcbaEYezqY8jRD5b2JM4f2YoClzYxAcyOvTc/Oftalmo");
    const refDbw = admin.database().ref("malaDiretaAEnviar/Oftalmo");
    refDbw.set("true");
    refDbr.once("value")
        .then((snapshot) => {
          if (snapshot.exists()) {
            snapshot.val().forEach((element) => {
              refDbw.push(element);
            });
          } else {
            console.log("No data available");
          }
        }).catch((error) => {
          console.error(error);
        });
    // const storageRef = admin.storage().bucket("gs://oftautomacao-9b427.appspot.com/CirurgiaPlastica");
    // const file1 = storageRef.file("CirurgiaPlastica/cirurgia1.jpeg");
    // const storage = firebase.storage().ref();
    // console.log("ref"+JSON.stringify(
    // admin.storage().child("Cirurgia/cirurgia1.jpeg")));
    // const spaceRef = storageRef.child("CirurgiaPlastica/");
  });
});

exports.malaDiretaOftalmoZApi =
    functions.database.ref("malaDiretaAEnviar/Oftalmo/{pushId}")
        .onWrite((change, context) => {
          // Only edit data when it is first created.
          // if (change.before.exists()) {
          // return null;
          // }
          // Exit when the data is deleted.
          if (!change.after.exists()) {
            return null;
          }
          const element = change.after.val();
          console.log("Lendo Dataset"+JSON.stringify(element.Celular));
          const urlImage1 ="https://firebasestorage.googleapis.com/" +
          "v0/b/oftautomacao-9b427.appspot.com/o/" +
          "MalgimpPin.jpeg?alt=media" +
          "&token=2c954f9c-d035-40ae-a165-c8275da19a54";
          const text1 = "Boa tarde, ";
          const arrUrls = [text1, urlImage1];
          const arrMessageType = ["text", "image"];
          const whatsAppCel = "55" + element.Celular;
          const i = 0;
          // usar callZapiV2
          callZapi(arrUrls, arrMessageType, whatsAppCel, i);
        });

exports.buscaAtiva45SynchEnviados = functions.https.
    onRequest((req, resp) => {
      cors(req, resp, () => {
        console.log("Entrou Função synchEnviados");
        const db = admin.database();
        try {
          const refBuscaAtiva = db.ref("OFT/45/buscaAtiva/enviados");
          const refEnviados = db.ref("1ls-thM9Joc4nS1zCCNMIHfTbt"+
            "fSAQqFbEPWmyH0bYW4/JaEnviados");
          refEnviados.once("value")
              .then((snapshot) => {
                if (snapshot.exists()) {
                  console.log("Entrou snapshot.exist");
                  console.log(snapshot.val());
                  refBuscaAtiva.set(snapshot.val());
                }
              });
        } catch (err) {
          // ... error checks
          console.log("Erro try: " + JSON.stringify(err));
        }
        resp.status(200).end();
      });
    });
*/


/*
exports.atendimentoRapido45TpfrmWH = functions.https.
    onRequest((req, resp) => {
      cors(req, resp, () => {
        console.log("Entrou atendimentoRapido45TpfrmWH");
        console.log("req.body: ", JSON.stringify(req.body));
        resp.status(200).end();
        /*
        const today = new Date();
        const year = today.getFullYear();
        const mm = today.getMonth()+1;
        const dd = today.getDate();
        const diaDaSemana = today.getDay();
        try {
          // console.log("Entrou try");
          return sqlConnection.connect(sqlConfig).then((pool) => {
            // console.log("Entrou connect");
            let sql = "";
            sql = "INSERT INTO dbo._TypFrm_Sis_PacienteTrg_v2";
            sql = sql + "([IDSubmissionToken]";
            sql = sql + "  ,[Pessoa]";
            sql = sql + "  ,[CPF]";
            sql = sql + "  ,[TelefoneCelular]";
            sql = sql + "  ,[Email]";
            sql = sql + "  ,[Endereco]";
            sql = sql + "  ,[Bairro]";
            sql = sql + "  ,[CEP]";
            sql = sql + "  ,[Nascimento]";
            sql = sql + "  ,[Genero]";
            sql = sql + "  ,[Identidade]";
            sql = sql + "  ,[EmissaoIdentidade]";
            sql = sql + "  ,[TipoCirurgia]";
            sql = sql + "  ,[Convenio]";
            sql = sql + "  ,[Empresa]";
            sql = sql + "  ,[IDMarcacao]";
            sql = sql + "  ,[IDMarcacaoCirurgia])";
            sql = sql + "VALUES";
            sql = sql + "  (<IDSubmissionToken, varchar(100),>";
            sql = sql + "  ,<Pessoa, [dbo].[TDescricaoLonga],>";
            sql = sql + "  ,<CPF, [dbo].[TCPF],>";
            sql = sql + "  ,<TelefoneCelular, [dbo].[TTelefone],>";
            sql = sql + "  ,<Email, [dbo].[TEmail],>";
            sql = sql + "  ,<Endereco, [dbo].[TEndereco],>";
            sql = sql + "  ,<Bairro, [dbo].[TDescricaoCurta],>";
            sql = sql + "  ,<CEP, [dbo].[TCEP],>";
            sql = sql + "  ,DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)";
            sql = sql + "  ,<Genero, varchar(20),>";
            sql = sql + "  ,<Identidade, [dbo].[TIdentidade],>";
            sql = sql + "  ,DATETIMEFROMPARTS (" + year + ","+ mm + ","+ dd;
            sql = sql + ",0,0,0,0)";
            sql = sql + "  ,<TipoCirurgia, varchar(50),>";
            sql = sql + "  ,<Convenio, varchar(40),>";
            sql = sql + "  ,<Empresa, char(3),>";
            sql = sql + "  ,<IDMarcacao, int,>";
            sql = sql + "  ,<IDMarcacaoCirurgia, int,>)";
            return pool.query(sql);
            // const result = pool.query(sql);
          });
        } catch (err) {
          console.log("Erro try: " + JSON.stringify(err));
        }
        // -------------- FIM COMENTARIO ASTERISCO/------------------------
      });
    });

exports.equipamentosRDH = functions.https.
    onRequest((req, resp) => {
      cors(req, resp, () => {
        // console.log("Response:"+JSON.stringify(req.query.cod));
        console.log("Entrou na função equipamentos RDH");
        resp.end("Ok"+resp.status.toString());
      });
    });

exports.functionTeste = functions.https.
    onRequest((req, resp) => {
      cors(req, resp, () => {
        console.log("Entrou na functionTeste");
        resp.end("Ok "+ req.query.token + resp.status.toString());
      });
    });
*/

exports.pamCampanhaGeralCriarNo = functions.https.
    onRequest((req, resp) => {
      console.log("Entrou no criar nó");
      const db = admin.database();
      db.ref("PAM/campanhaPlanilha/projetoVerao/enviados/")
          .set(true);
      resp.end("Ok\n"+resp.status.toString());
    });


// exports.pamCampanhaGeralJson = functions.https
//     .onRequest((req, resp) => {
exports.pamCampanhaGeralJson = functions.pubsub
    .schedule("00 8-17 * * 1-5")
    .timeZone("America/Sao_Paulo") // Users can choose timezone
    .onRun((context) => {
      console.log("Entrou pamCampanhaGeralJson");
      const promises = [];
      let monthEnvio;
      let dayEnvio;
      let dataEnvio;
      let yearEnvio;
      let sendDate;
      const today = new Date();
      const todayDate = today.getDate()+"/"+(today.getMonth()+1)+"/"+
      today.getFullYear();
      const db = admin.database();
      db.ref("PAM/campanhaPlanilha/aEnviarOnWrite").set(true);
      promises.push(db.ref("PAM/campanhaPlanilha/configuracoes/")
          .once("value"));
      promises.push(db.ref("PAM/_dadosComuns/cancelados/").once("value"));

      return Promise.all(promises).then((res) => {
        console.log("Entrou Promise config e cancel");
        // Armazenamento leitura dos DB
        // const aEnviar = res[0].val();
        // const enviados = res[1].val();
        const configuracoes = res[0].val();
        const cancelados = res[1].val();

        // console.log("configuracoes: " + JSON.stringify(configuracoes));

        Object.entries(configuracoes).
            forEach(([nomeCampanha, detalhes]) => {
              if (detalhes["Status do Programa"] === "Ativado") {
                const promises2 = [];
                promises2.push(db.ref("PAM/campanhaPlanilha/" + nomeCampanha +
                  "/pacientesCompleto/").once("value"));
                promises2.push(db.ref("PAM/campanhaPlanilha/" + nomeCampanha +
                  "/enviados/").once("value"));

                return Promise.all(promises2).then((res2) => {
                  console.log("Entrou Promise");
                  // Armazenamento leitura dos DB
                  const aEnviar = res2[0].val();
                  const enviados = res2[1].val();
                  const quantidadeEnvio = detalhes["Qtd a Enviar"];
                  const status = detalhes["Status do Programa"];
                  const mensagem = detalhes["Mensagem"];
                  const diasReenviar = detalhes["Dias para Reenviar"];

                  console.log("aEnviar: " + JSON.stringify(aEnviar));
                  console.log("enviados: " + JSON.stringify(enviados));
                  console.log("cancelados: " + JSON.stringify(cancelados));
                  console.log("quantidadeEnvio: " + quantidadeEnvio);
                  console.log("Detalhes: " + JSON.stringify(detalhes));
                  console.log("status: " + JSON.stringify(status));
                  console.log("Nome da Campanha:: " + nomeCampanha);
                  console.log("Mensagem: " + mensagem);
                  console.log("diasReenviar: " + diasReenviar);

                  // Processamento dos Enviados
                  // Remoção de pacientes enviados há mais de 1 mês
                  const entriesEnviados = Object.entries(enviados);
                  const entriesAEnviar = Object.entries(aEnviar);
                  // const entriesCancelados = Object.entries(cancelados);
                  const enviadosFiltrado = {};
                  let countEnviadosFiltrado = 0;
                  let count = 0;
                  let countLidos = 0;
                  // let countAgendados = 0;
                  // let countUltimoAno = 0;
                  let countEnviados = 0;
                  let countCancelados = 0;

                  // Cancelados
                  // Retirar enviados há mais de um mês
                  entriesEnviados.forEach((element) => {
                    dataEnvio = element[1].DataEnvio;
                    dayEnvio = dataEnvio.split("/")[0];
                    monthEnvio = dataEnvio.split("/")[1];
                    yearEnvio = dataEnvio.split("/")[2];
                    sendDate = new Date(monthEnvio+"/"+
                      dayEnvio+"/"+yearEnvio);
                    sendDate.setDate(sendDate.getDate()+diasReenviar);
                    console.log("original_diasReenviar: " + diasReenviar);
                    if (sendDate>today) {
                      countEnviadosFiltrado+=1;
                      enviadosFiltrado[element[0]] = element[1];
                    }
                  });
                  console.log("Passou For Each Enviados");

                  // Filtrando a Enviar
                  const entriesEnviadosFiltrados =
                    Object.entries(enviadosFiltrado);
                  console.log(JSON.stringify(
                      "entriesEnviadosFiltrados: " + entriesEnviadosFiltrados));
                  const dataAtualAux = new Date();
                  const dataAtual = JSON.stringify(dataAtualAux);

                  // Lê entriesAEnviar do fim pro inicio
                  if (status == "Ativado") {
                    entriesAEnviar.slice().reverse().forEach((pacAEnviar)=>{
                      pacAEnviar[1].mensagem = mensagem;
                      // console.log("pacAEnviar: " +
                      // JSON.stringify(pacAEnviar));
                      countLidos+=1;
                      const telLimpo = tel2Whats(pacAEnviar[1].Telefone);
                      if ((count<quantidadeEnvio) && (telLimpo.length>0)) {
                        // enviados
                        if (entriesEnviadosFiltrados.some((pacEnviado) =>
                          tel2Whats(pacEnviado[1].Telefone) ==
                          tel2Whats(pacAEnviar[1].Telefone))) {
                          countEnviados+=1;
                          // console.log("pacAEnviar2 " +
                          // pacAEnviar[1].Paciente);

                        // cancelados
                        } else {
                          let cancelou = false;
                          // console.log("pacAEnviar[1].
                          // Telefone antes stringify" +pacAEnviar[1].Telefone);
                          // pacAEnviar[1].Telefone = JSON.
                          //     stringify(pacAEnviar[1].Telefone);
                          // console.log("pacAEnviar[1].
                          // Telefone depois striingify" +
                          //   pacAEnviar[1].Telefone);
                          const whatsApp = tel2Whats(pacAEnviar[1].Telefone)
                              .substring(2, 13);
                          // console.log("whatsapp " + whatsApp);
                          if (cancelados[whatsApp]) {
                            const pacCanc = cancelados[whatsApp];
                            // console.log("pacCanc " +
                            // JSON.stringify(pacCanc));
                            if ((pacCanc.Reenviar.toString() == "") ||
                              (JSON.stringify(pacCanc.Reenviar) > dataAtual)) {
                              cancelou = true;
                            } else {
                              db.ref("PAM/_dadosComuns/cancelados/" +
                              whatsApp).set(null);
                            }
                          }
                          if (cancelou) {
                            countCancelados+=1;

                          // enviar
                          } else {
                            // console.log("enviou " + pacAEnviar[1].Paciente);
                            db.ref("PAM/campanhaPlanilha/aEnviarOnWrite")
                                .push(pacAEnviar[1]);
                            pacAEnviar[1].DataEnvio = todayDate;
                            enviadosFiltrado[pacAEnviar[0]] = pacAEnviar[1];
                            count+=1;
                          }
                        }
                      }
                    });
                  } else {
                    console.log("Campanha "+ nomeCampanha +" DESATIVADA");
                  }
                  console.log("Cancelados: " + countCancelados);
                  console.log("Ja enviados no ultimo mes: " + countEnviados);
                  console.log("Enviados Filtrado: " + countEnviadosFiltrado);
                  console.log("Lidos: " + countLidos);
                  console.log("Enviados com sucesso: " + count);

                  // não salvar no nó
                  // if (ambiente === "producao") {
                  db.ref("PAM/campanhaPlanilha/"+nomeCampanha+"/enviados").
                      set(enviadosFiltrado);
                  // console.log("->>>" +
                  //   JSON.stringify(Object.entries(enviadosFiltrado)));
                  // }
                });
              }
            });
        // resp.end("Ok"+resp.status.toString());
        return null;
      });
    });

// realizar as alterações
exports.pamCampanhaGeralZApi =
functions.database.ref("PAM/campanhaPlanilha/aEnviarOnWrite/{pushId}")
    .onWrite((change, context) => {
      console.log("Entrou pamCampanhaGeralZApi");
      if (!change.after.exists()) {
        return null;
      }
      const element = change.after.val();
      console.log(JSON.stringify(element));

      // let paciente = "";
      // if (element.Paciente) {
      //   paciente = element.Paciente;
      // }
      let whatsAppCel;
      if (element.Telefone) {
        whatsAppCel = tel2Whats(element.Telefone);
      }
      // let mensagem;
      // if (element.mensagem) {
      //   mensagem = element.mensagem;
      // }

      const whatsAppCelAux = whatsAppCel;

      if (ambiente == "teste") whatsAppCel = "5521971938840";

      if (whatsAppCel) {
        let parametros = {};
        if (ambiente == "teste") {
          parametros = {
            // whatsAppCel: whatsAppCel,
            id: "3B74CE9AFF0D20904A9E9E548CC778EF",
            token: "A8F754F1402CAE3625D5D578",
            // optionList: optionList,
          };
        } else {
          parametros = {
            // whatsAppCel: whatsAppCel,
            id: "3D460A6CB6DA10A09FAD12D00F179132",
            token: "1D2897F0A38EEEC81D2F66EE",
            // optionList: optionList,
          };
        }
        // mensagem = mensagem.replace("<<paciente>>", paciente);
        // mensagem = mensagem.replace("<<Paciente>>", paciente);
        // const whatsAppMsg = campanhaGeralReplace(mensagem);

        let whatsAppMsg = campanhaGeralReplace(element);
        // console.log("MENSAGEM DE SAIDA: " + whatsAppMsg);


        if (ambiente === "teste") {
          whatsAppMsg = whatsAppCelAux + " \n\n " + whatsAppMsg;
        }

        const urlImage ="https://firebasestorage.googleapis.com" +
        "/v0/b/oftautomacao-9b427.appspot.com/o/" +
        "CirurgiaPlastica%2FLipoaspira%C3%A7%C3%A3o%20" +
        "-%20Projeto%20Ver%C3%A3o.png?alt=media&token=6a450f73" +
        "-d7bb-4ea9-bbfc-1069e5c55da8";

        const arrMessage = [{
          "phone": whatsAppCel,
          "image": urlImage,
        }, {
          "phone": whatsAppCel,
          "message": whatsAppMsg,
        }];

        const i = 0;
        callZapiV3(arrMessage, parametros, i);
      }
    });


/**
 * campanhaGeralReplace - adiciona replace em mensagem a enviar
 * @constructor
 * @param {Object} element
 * @param {string} msgSaida
 */
function campanhaGeralReplace(element) {
  // console.log("element dento: "+ JSON.stringify(element));

  // Obtendo as chaves do objeto
  const chaves = Object.keys(element);
  const regex = /data/i; // O 'i' ignora maiúsculas e minúsculas
  let msgSaida = element["mensagem"];
  // console.log("element[mensagem]:"+ element["mensagem"]);

  chaves.forEach((keysName) => {
    const strBusca = ("<<" + keysName + ">>");
    // console.log("strBusca - element[keysName]:" +
    //       strBusca + "-" + element[keysName]);

    if (regex.test(keysName)) {
      let day = element[keysName].split("-")[2];
      day = day.split("T")[0];
      const month = element[keysName].split("-")[1];
      const year = element[keysName].split("-")[0];
      const date = day + "/" + month + "/" + year;
      element[keysName] = date;
      // console.log("element[keysName]:" + element[keysName].split("-")[0]);
      // console.log("date: " + date);
    }
    msgSaida = msgSaida.replace(strBusca, element[keysName]);
  });

  // dois metodos de procurar emoji
  // console.log(emoji.which("🚨"));
  // console.log(emoji.find("✅"));

  return msgSaida;
}

// ---------------------------KatIA----------------------------------------

// /**
//  * Remove acentos de uma string.
//  * @param {string} str - A string da qual os acentos serão removidos.
//  * @return {string} - A string sem acentos.
//  */
// function removerAcentos(str) {
//   return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
// }

// const db = admin.firestore();
const express = require("express");
const axios = require("axios");
// const {Configuration, OpenAIApi} = require("openai");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

// const configuration = new Configuration({
const openai = new OpenAI({
  apiKey: "sk-proj-QGH3tRjLTDV2J3ucOKOFzNEYmZmql_" +
          "OLeJ0JJFfn_tv7OyY9u_RTojVkmn07A3S63n_" +
          "IrWpV2JT3BlbkFJWNjY2hcy7jzBoWfFNl_" +
          "CCgmlAqaN_pSe3WPRFV3Y0AYb-q1DQDpXqTfsKcOfeU__" +
          "-ZjGo1iosA",
});
let glbPhone = null;
let glbMessage = null;
let glbFluxo = null;
let glbEtapa = null;
let glbIndLog = 0;
let glbAgora = null;
let glbHistoricoDaConversa = {};
let glbInformacoesExtraidas = {};
let glbConfiguracoes = {};
const updates = {};

// **************************************************************
// Função para enviar mensagens via WhatsApp
// **************************************************************
/**
 * @async
 * @function drmEnviarMensagemWhatsApp
 * @param {string} mensagem - Mensagem a ser enviada.
 * @return {Promise<boolean>}
 */
async function drmEnviarMensagemWhatsApp(mensagem) {
  let parametros = {};
  if (ambiente == "teste") {
    parametros = {
      id: "3B74CE9AFF0D20904A9E9E548CC778EF",
      token: "A8F754F1402CAE3625D5D578",
    };
  } else {
    parametros = {
      id: "3D460A6CB6DA10A09FAD12D00F179132",
      token: "1D2897F0A38EEEC81D2F66EE",
    };
  }

  const arrMessage = [{
    "phone": glbPhone,
    "message": mensagem,
  }];

  const i = 0;
  if (!((ambiente === "teste") && (execucaoFuntions === "emulador"))) {
    callZapiV3(arrMessage, parametros, i);
  }
}

// **************************************************************
// Função para responder os preços dos exames particulares
// **************************************************************
/**
 * @async
 * @function agenteResponderPrecosExames
 * @param {Array} examesPacientes
 * @return {Promise<string>}
 */
async function agenteResponderPrecosExames(examesPacientes) {
  logar("Entrou agenteResponderPrecosExames");

  let ultMsgOpenAI;
  const db = admin.database();

  if (glbHistoricoDaConversa.length >= 3) {
    const ult = glbHistoricoDaConversa.length - 1;
    const penult = glbHistoricoDaConversa.length - 2;
    const antPenult = glbHistoricoDaConversa.length - 3;

    if (glbHistoricoDaConversa[ult].role === "assistant") {
      ultMsgOpenAI = glbHistoricoDaConversa[ult].content;
    } else if (glbHistoricoDaConversa[penult].role === "assistant") {
      ultMsgOpenAI = glbHistoricoDaConversa[penult].content;
    } else if (glbHistoricoDaConversa[antPenult].role === "assistant") {
      ultMsgOpenAI = glbHistoricoDaConversa[antPenult].content;
    }
  }

  const snapshot = await db
      .ref("/DRM/agendamentoWhatsApp/configuracoes/exames")
      .once("value");
  const valorExames = snapshot.val();

  const dbRef = admin.database();
  const configuracoesSnapshot = await dbRef.
      ref("/DRM/agendamentoWhatsApp/configuracoes").once("value");
  let prompt = configuracoesSnapshot.val()
      .definicoesIA.agenteResponderPrecosExames.definicao;

  logar("examesPacientes:" + JSON.stringify(examesPacientes));

  prompt = `Você é uma atendente virtual do Dr. Melo.
  Voce disse: "${ultMsgOpenAI}".
  O paciente possui o convênio particular 
  e realizará os exames ${examesPacientes}.\n` +
  prompt +
  `\nForneça apenas os preços desses exames: ${examesPacientes}.
  \n\nOs exames com seus respectivos preços estão  no JSON:
  "${JSON.stringify(valorExames)}" 
  `;
  logar("prompt agenteResponderPrecosExames: " + JSON.stringify(prompt),
      glbPhone);

  return await chamarOpenAI(prompt);
}

// **************************************************************
// Função para processar mensagens com OpenAI
// **************************************************************
/**
 * @async
 * @function agenteProcessarMensagem
 * @return {Promise<string>}
 */
async function agenteProcessarMensagem() {
  logar("Entrou no agenteProcessarMensagem");
  logar("glbEtapa:" + glbEtapa);

  // Vewrifica se há pacientes particulares e preenche examesPacientes
  const examesPacientes = [];
  glbInformacoesExtraidas.pacientes.forEach((paciente) => {
    if (paciente.convenio) {
      // Normaliza para evitar problemas de case sensitivity
      const convenio = paciente.convenio.toLowerCase();

      if (convenio === "particular" && paciente.exames) {
        examesPacientes.push(paciente.exames.join(", "));
      }
    }
  });

  if (glbEtapa === "EXAMES" && examesPacientes.length > 0) {
    return await agenteResponderPrecosExames(examesPacientes);
  } else {
    try {
      // logar("glbHistoricoDaConversa: " +
      //     JSON.stringify(glbHistoricoDaConversa));
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: glbHistoricoDaConversa,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Erro ao processar mensagem com OpenAI:", error.message);
      return "Peço desculpas, não consegui entender sua mensagem. " +
      "Poderia repetir, por favor?";
    }
  }
}

// **************************************************************
// Apagar Consulta a Cancelar No Reagendamento
// **************************************************************
/**
 * @function apagarConsultaACancelarNoReagend
 * @return {boolean} - Retorna true.
 ****************************************************************/
function apagarConsultaACancelarNoReagend() {
  logar("Entrou em apagarConsultaACancelarNoReagend");

  const db = admin.database();

  // Apagar nó cancelarAgendReagend
  db.ref("/DRM/agendamentoWhatsApp/operacional/conversas/" +
    glbPhone + "/cancelarAgendReagend").set(false);

  return true;
}

// **************************************************************
// Função para criar agendamentos na base de dados
// **************************************************************
/**
 * @function apagarFluxo
 * @return {boolean} - Retorna true.
 ****************************************************************/
function apagarFluxo() {
  logar("Entrou em apagarFluxo");

  const db = admin.database();
  db.ref("/DRM/agendamentoWhatsApp/operacional/conversas/" + glbPhone +
    "/fluxo").set(false);

  apagarConsultaACancelarNoReagend();

  return true;
}

// **************************************************************
// Processa Agendamento na mesma Data/Hora
// **************************************************************
/**
 * @async
 * @function cancelarAgendamMesmaDataHora
 * @param {Object} element - JSON com dados da consulta a cancelar.
 * @return {Promise<Object|null>} - Retorna true.
 ****************************************************************/
// async function cancelarAgendamMesmaDataHora(element) {
//   logar("Entrou em cancelarAgendamMesmaDataHora");

//   const mensagem = "Havia uma consulta agendada por voce nessa " +
//   "data/hora na unidade " + element.unidade +
//   ". Automaticamente ela foi substituida pelo novo agendamento.";

//   drmEnviarMensagemWhatsApp(mensagem);

//   // Cancela consulta agendada
//   cancelarConsulta(element);

//   return true;
// }

// **************************************************************
// Função para obter Consulta A Reagendar
// **************************************************************
/**
 * @async
 * @function obterConsultaAReagendar
 * @return {Promise<Object|null>} - Retorna os dados do agendamento criado.
 ****************************************************************/
async function obterConsultaAReagendar() {
  logar("Entrou em obterConsultaAReagendar");

  const db = admin.database();
  let elementCancelar = null;
  // Obtem o agendamento para ser cancelado para o reagendamento
  const elementCancelarSnapshot = await db.ref("/DRM/agendamentoWhatsApp/" +
    "operacional/conversas/" + glbPhone +
    "/cancelarAgendReagend").once("value");

  if (elementCancelarSnapshot.val()) {
    elementCancelar = elementCancelarSnapshot.val().pacientes;
  }

  logar("elementCancelar do nó cancelarAgendReagend: " +
      JSON.stringify(elementCancelar));
  if (!elementCancelar) {
    // Obtem agendamentos daquele telefone
    const consultasAgendadasSnapshot = await db
        .ref("/DRM/agendamentoWhatsApp/operacional/consultasAgendadas/" +
        "telefones/" + glbPhone)
        .once("value");
    const consultasAgendadas = consultasAgendadasSnapshot.val();
    logar("consultasAgendadas: " +
      JSON.stringify(consultasAgendadas));

    if (consultasAgendadas) {
      const listaKeysDatasAgendadas = Object.keys(consultasAgendadas);
      logar("listaKeysDatasAgendadas: " +
        JSON.stringify(listaKeysDatasAgendadas));

      if (listaKeysDatasAgendadas && (listaKeysDatasAgendadas.length === 1)) {
        const listaValuesDatasAgendadas = Object.values(consultasAgendadas);
        const listaKeysHorariosAgendados =
            Object.keys(listaValuesDatasAgendadas[0]);
        logar("listaKeysHorariosAgendados: " +
          JSON.stringify(listaKeysHorariosAgendados));

        if (listaKeysHorariosAgendados &&
           (listaKeysHorariosAgendados.length === 1)) {
          const listaValuesHorariosAgendados =
              Object.values(listaValuesDatasAgendadas[0]);
          elementCancelar = [listaValuesHorariosAgendados[0]];
        }
      }
    }
  }
  return elementCancelar;
}

// **************************************************************
// Função para criar agendamentos na base de dados
// **************************************************************
/**
 * @async
 * @function processarAgendamCancelam
 * @return {Promise<Object|null>} - Retorna os dados do agendamento criado.
 ****************************************************************/
async function processarAgendamCancelam() {
  logar("Entrou em processarAgendamCancelam");

  const db = admin.database();

  // Obtem agendamentos daquele telefone
  const consultasAgendadasSnapshot = await db
      .ref("/DRM/agendamentoWhatsApp/operacional/consultasAgendadas/" +
      "telefones/" + glbPhone)
      .once("value");
  const consultasAgendadas = consultasAgendadasSnapshot.val();

  // Obtem o agendamento para ser cancelado para o reagendamento
  const elementCancelar = await obterConsultaAReagendar();
  logar("elementCancelar: " + JSON.stringify(elementCancelar));

  glbInformacoesExtraidas.pacientes.forEach((element) => {
    let dataISO = null;
    if (element.dataAgendada) {
      dataISO = converterData(element.dataAgendada);
    }
    const {horaAgendada} = element;
    if (glbFluxo === "AGENDAR") {
      // if (dataISO &&
      //     consultasAgendadas &&
      //     consultasAgendadas[dataISO] &&
      //     consultasAgendadas[dataISO][horaAgendada]) {
      //   //
      //   const elementCancelar = consultasAgendadas[dataISO][horaAgendada];
      //   cancelarAgendamMesmaDataHora(elementCancelar);
      // }
      //
      // Grava consulta agendada
      element.telefone = glbPhone;
      agendarConsulta(element);
      apagarFluxo();
    }

    // Processa cancelamento
    if ((glbFluxo === "CANCELAR") &&
        dataISO &&
        (consultasAgendadas &&
        consultasAgendadas[dataISO] &&
        consultasAgendadas[dataISO][horaAgendada])) {
      //
      // Cancela consulta agendada
      element.telefone = glbPhone;
      cancelarConsulta(element);
      apagarFluxo();
    }
    logar("glbFluxo em processarAgendamCancelam: " + glbFluxo);

    // Processa Reagendamento
    if (glbFluxo === "REAGENDAR") {
      let dataISO = null;
      if (elementCancelar[0].dataAgendada) {
        dataISO = converterData(elementCancelar[0].dataAgendada);
      }
      const {horaAgendada} = elementCancelar[0];

      if (dataISO &&
        (consultasAgendadas &&
        consultasAgendadas[dataISO] &&
        consultasAgendadas[dataISO][horaAgendada])) {
        //
        element.telefone = glbPhone;
        elementCancelar[0].telefone = glbPhone;

        agendarConsulta(element);
        if ((element.unidade !== elementCancelar[0].unidade) ||
            (element.dataAgendada !== elementCancelar[0].dataAgendada) ||
            (element.horaAgendada !== elementCancelar[0].horaAgendada)) {
          cancelarConsulta(elementCancelar[0]);
        }
        apagarFluxo();
      }
    }
  });
}

// **************************************************************
// Função para criar agendamentos na base de dados
// **************************************************************
/**
 * @async
 * @function agendarConsulta
 * @param {Object} element - JSON com todos os dados da consulta.
 * @return {Promise<Object|null>} - Retorna os dados do agendamento criado.
 ****************************************************************/
async function agendarConsulta(element) {
  logar("Entrou em agendarConsulta");

  const db = admin.database();
  const phone = element.telefone;

  // Agenda consulta
  const dataISO = converterData(element.dataAgendada);

  db.ref("/DRM/agendamentoWhatsApp/operacional/consultasAgendadas/" +
      "unidades/" + element.unidade + "/" + dataISO + "/" +
      element.horaAgendada)
      .set(element);
  db.ref("/DRM/agendamentoWhatsApp/operacional/consultasAgendadas/" +
      "telefones/" + phone + "/" + dataISO + "/" + element.horaAgendada)
      .set(element);

  if (ambiente !== "producao") {
    drmEnviarMensagemWhatsApp("Consulta Agendada");
  }
}

// **************************************************************
// Função para excluir agendamentos na base de dados
// **************************************************************
/**
 * @async
 * @function converterData
 * @param {String} data - data no formato dd/mm/aaa.
 * @return {String} - Retorna data no formato aaaa-mm-dd
 ****************************************************************/
function converterData(data) {
  const [dia, mes, ano] = data.split("/");
  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

// **************************************************************
// Função para excluir agendamentos na base de dados
// **************************************************************
/**
 * @async
 * @function cancelarConsulta
 * @param {Object} element - JSON com todos os dados da consulta.
 * @return {Promise<Object|null>} - Retorna os dados do agendamento cancelado
 * ou null se não encontrado.
 ****************************************************************/
async function cancelarConsulta(element) {
  logar("Entrou em cancelarConsulta");

  const db = admin.database();
  const phone = element.telefone;

  const {unidade, dataAgendada, horaAgendada}= element;
  const dataISO = converterData(dataAgendada);

  try {
    db.ref("/DRM/agendamentoWhatsApp/operacional/consultasAgendadas/" +
        "unidades/" + unidade + "/" + dataISO + "/" +
        horaAgendada)
        .remove();
    db.ref("/DRM/agendamentoWhatsApp/operacional/consultasAgendadas/" +
        "telefones/" + phone + "/" + dataISO + "/" + horaAgendada)
        .remove();
    db.ref("/DRM/agendamentoWhatsApp/operacional/consultasCanceladas/" +
        "unidades/" + unidade + "/" + dataISO + "/" +
        horaAgendada)
        .set(element);
    db.ref("/DRM/agendamentoWhatsApp/operacional/consultasCanceladas/" +
        "telefones/" + phone + "/" + dataISO + "/" + horaAgendada)
        .set(element);

    if (ambiente !== "producao") {
      drmEnviarMensagemWhatsApp("Consulta Cancelada");
    }
    //
  } catch (error) {
    console.error("Erro ao cancelar consulta:", error);
    throw new Error("Não foi possível cancelar a consulta.");
  }
  return element;
}


// **************************************************************
// Se passou de 24h da ultima conversa, historico é apagado
// **************************************************************
/**
 * @async
 * @function apagarHistoricoApos24h
 * @return {Promise<Array<{role: string, content: string}>>} - Retorna o
 * historico da conversa.
 */
async function apagarHistoricoApos24h() {
  logar("Entrou no apagarHistoricoApos24h");

  const moment = require("moment");
  let dataMaisRecente = null;

  // if (doc.exists) {
  if (glbHistoricoDaConversa) {
    // --------------------------------------
    // obter a data mais recente a partir do historico da conversa
    dataMaisRecente = await obterDataMaisRecente();
    // --------------------------------------

    if (dataMaisRecente && dataMaisRecente.isValid()) {
      // Converte para horario de Brasilia
      const now = moment().subtract(3, "hours"); // horario Brasilia
      // if (ambiente === "teste") {
      // // Para teste
      //   now = moment("2025-01-28 12:40:50"); // força data de hoje para teste
      // }

      // Calculando diferença em dias
      const diffInDays = now.diff(dataMaisRecente, "days");

      // Verifica se a diferença é maior que 1 dia
      if (diffInDays >= 1) {
        // apagar do firestore e salvar no firebase
        await apagarHistoricoNaBD(dataMaisRecente);
        await apagarFluxo();
        glbHistoricoDaConversa = null;
      } else {
        logar("Não apagou conversa. Não se passaram 24h.");
      }
    } else {
      logar("Nenhuma data válida encontrada no histórico da conversa.",
          glbPhone);
    }
  }
  return glbHistoricoDaConversa;
}

// **************************************************************
// Se iniciou nova fluxo, historico é apagado
// **************************************************************
/**
 * @async
 * @function apagarHistoricoParaNovoFluxo
 * @return {Promise<Array<{role: string, content: string}>>} - Retorna o
 * historico da conversa.
 */
async function apagarHistoricoParaNovoFluxo() {
  logar("Entrou no apagarHistoricoParaNovoFluxo");

  const db = admin.database();
  let fluxoLido = "INDETERMINADA";
  if (glbFluxo) {
    fluxoLido = glbFluxo;
  }
  logar("fluxoLido: " + JSON.stringify(fluxoLido));

  const fluxoAgente = await agenteFluxo();
  logar("fluxoAgente: " + JSON.stringify(fluxoAgente));

  if ((fluxoLido !== fluxoAgente) && (fluxoAgente !== "INDETERMINADA") &&
    !((fluxoLido === "REAGENDAR") && (fluxoAgente === "AGENDAR")) &&
    !((fluxoLido === "AGENDAR") && (fluxoAgente === "REAGENDAR"))) {
    db.ref("/DRM/agendamentoWhatsApp/operacional/conversas/" + glbPhone +
        "/fluxo")
        .set(fluxoAgente);
    glbFluxo = fluxoAgente;
    logar("Salvou fluxoAgente: " + JSON.stringify(fluxoAgente));
    if (fluxoLido !== "INDETERMINADA") {
      apagarHistorico();
      glbHistoricoDaConversa = await inicializaHistoricoDaConversa();
      glbHistoricoDaConversa.push({role: "user", content: "Olá"});
      glbHistoricoDaConversa.push({role: "assistant",
        content: "Olá! Eu sou a Katia, sua assistente virtual. Como posso " +
        "ajudar?"});
    }
  }
  return glbHistoricoDaConversa;
}

// **************************************************************
// inicializaHistoricoDaConversa
// **************************************************************
/**
 * @async
 * @function inicializaHistoricoDaConversa
 * @return {Promise<Array<{role: string, content: string}>>} - Retorna o
 * historico da conversa.
 */
async function inicializaHistoricoDaConversa() {
  logar("Entrou no inicializaHistoricoDaConversa");

  const today = new Date();
  today.setHours(today.getHours()-3);

  const dbRef = admin.database();

  // Obtem definição da KatIA
  const configuracoesSnapshot = await dbRef.
      ref("/DRM/agendamentoWhatsApp/configuracoes").once("value");
  const prompts = Object.values(configuracoesSnapshot.val()
      .definicoesIA2.agenteAtendimento || []);
  let strContent = "";
  prompts.forEach((prompt) => {
    strContent = strContent + "\n\n " + prompt.definicao;
  });

  // logar("strContent agenteAtendimento: " + strContent);

  // Adiciona a data de hoje para referencia
  strContent = strContent + `\n\n Considere que hoje e agora é: \n\n${today}`;

  // // Adiciona os convenios aceitos em cada unidade
  // const unidadesConvenios = configuracoesSnapshot.val().unidadesConvenios;
  // strContent = strContent +
  //   " \n\n Os convenios aceitos em cada unidade estão nesse JSON " +
  //   "'unidadesConvenios': " + JSON.stringify(unidadesConvenios);

  // Adiciona os convenios
  const convenios = configuracoesSnapshot.val().convenios;
  strContent = strContent +
    " \n\n O JSON 'convenios' é: " + JSON.stringify(convenios);

  // Adiciona os exames
  const exames = configuracoesSnapshot.val().exames;
  strContent = strContent +
    " \n\n O JSON 'exames' é: " + JSON.stringify(exames);

  // Adiciona as cirurgias
  const cirurgias = configuracoesSnapshot.val().cirurgias;
  strContent = strContent +
    " \n\n O JSON 'cirurgias' é: " + JSON.stringify(cirurgias);

  // Adiciona as unidades
  const unidades = configuracoesSnapshot.val().unidades;
  strContent = strContent +
    " \n\n O JSON de 'unidades' com seus respectivos " +
    "endereços e whatsApp são: " + JSON.stringify(unidades);

  return [
    {role: "system", content: strContent,
    },
  ];
}

// **************************************************************
// Obtem fluxo lido da base de dados
// **************************************************************
/**
 * @async
 * @function lerFluxo
 * @return {string} - Retorna o fluxo lido da base de dados
 */
async function lerFluxo() {
  logar("Entrou no lerFluxo");
  // Obtem fluxo
  const db = admin.database();
  const fluxoSnapshot = await db
      .ref("/DRM/agendamentoWhatsApp/operacional/conversas/" + glbPhone +
        "/fluxo")
      .once("value");
  return fluxoSnapshot.val();
}
// **************************************************************
// Fetches the conversation history for a given phone number from the database.
// If no history exists, returns a default system message.
// **************************************************************
/**
 * @async
 * @function obterHistoricoDaConversa
 * @return {Promise<Array<{role: string, content: string}>>} - Retorna o
 * historico da conversa.
 */
async function obterHistoricoDaConversa() {
  logar("Entrou no obterHistoricoDaConversa");

  // logar("glbPhone: " + JSON.stringify(glbPhone));
  const doc = await admin.firestore().collection("historicoDaConversa")
      .doc(glbPhone).get();
  glbHistoricoDaConversa = null;
  if (doc.exists) {
    glbHistoricoDaConversa = doc.data().glbHistoricoDaConversa;
    // logar("doc: " + JSON.stringify(doc));
    // logar("doc.data(): " + JSON.stringify(doc.data()));
    // logar("doc.data().history: " + JSON.stringify(doc.data().history));
  }

  // ---------------------------------------------------
  if (glbHistoricoDaConversa) {
    glbHistoricoDaConversa = await apagarHistoricoApos24h();
  }
  // ---------------------------------------------------
  // if (!doc.exists) {
  if (!glbHistoricoDaConversa) {
    glbHistoricoDaConversa = await inicializaHistoricoDaConversa();
  }
  // ---------------------------------------------------
  glbFluxo = await lerFluxo();
  // ---------------------------------------------------
  if (glbHistoricoDaConversa) {
    glbHistoricoDaConversa = await apagarHistoricoParaNovoFluxo();
  }

  // return doc.data().history;
  return glbHistoricoDaConversa;
}

// **************************************************************
// Saves the conversation history for a given phone number to the database.
// **************************************************************
/**
 * @async
 * @function salvarHistoricoDaConversa
 * @return {Promise<void>} - Retorna quando o historico da conversa foi salvo
 */
async function salvarHistoricoDaConversa() {
  logar("Entrou no salvarHistoricoDaConversa");

  await admin.firestore().collection("historicoDaConversa")
      .doc(glbPhone).set({glbHistoricoDaConversa});
}

// **************************************************************
// Salva Consulta a Cancelar No Fluxo de Reagendamento
// **************************************************************
/**
 * @async
 * @function salvarConsultaACancelarNoReagend
 * @return {boolean} - Retorna true
 */
async function salvarConsultaACancelarNoReagend() {
  logar("Entrou no salvarConsultaACancelarNoReagend");

  const db = admin.database();
  // ler nó cancelarAgendReagend
  const consultaLidaSnapshot = await db
      .ref("/DRM/agendamentoWhatsApp/operacional/conversas/" +
      glbPhone + "/cancelarAgendReagend").once("value");

  if (!consultaLidaSnapshot.val()) {
    if (!glbInformacoesExtraidas) {
      // Usar a OpenAI para extrair os detalhes
      glbInformacoesExtraidas =
        await agenteExtracaoInfConversa();
    }

    // salvar no nó desejado
    await db.ref("/DRM/agendamentoWhatsApp/operacional/conversas/" +
      glbPhone + "/cancelarAgendReagend").set(glbInformacoesExtraidas);
    logar("glbInformacoesExtraidas salva em cancelarAgendReagend: " +
        JSON.stringify(glbInformacoesExtraidas));
  }
  return true;
}

// **************************************************************
// Obtem lista de unidades que atendem ao convenio
// **************************************************************
/**
 * @async
 * @function selecionarUnidadesAtendemConvenio
 * @param {string} convenio - convenino do paciente.
 * @return {Promise<Object|null>} - Retorna lista de unidades que
 * atendem ao convenio
 ****************************************************************/
async function selecionarUnidadesAtendemConvenio(convenio) {
  logar("Entrou em selecionarUnidadesAtendemConvenio");

  if (!convenio) {
    logar("Convenio não informado");
    return null;
  }

  try {
    // 1️⃣ Lê o nó onde estão os convênios de cada unidade
    const db = admin.database();
    const snap = await db
        .ref("/DRM/agendamentoWhatsApp/configuracoes/unidadesConvenios")
        .once("value");

    if (!snap.exists()) {
      logar("Nenhum dado em /unidadesConvenios");
      return null;
    }

    const unidadesConveniosObj = snap.val(); // { CiomMeier: { … }, … }
    const unidades = Object.values(unidadesConveniosObj); // array objs-unidade

    // 2️⃣ Filtra as unidades cujo campo convenio === "Sim"
    const atendem = unidades
        .filter((u) => u[convenio] && u[convenio].toLowerCase() === "sim")
        .map((u) => u.unidade || ""); // devolve só o nome da unidade

    logar(`Unidades que atendem o convenio ${convenio}: ${atendem}`);

    return atendem.length ? atendem : null;
  } catch (err) {
    logar(`Erro em selecionarUnidadesAtendemConvenio: ${err.message}`);
    throw err; // opcionalmente pode devolver null
  }
}

// **************************************************************
// Obtem informaçoes necessárias ao agendamento/cancelamento
// **************************************************************
/**
 * @async
 * @function acessarBaseDeDados
 * @return {Promise<Object|null>} - Retorna o histórico da conversa atualizado
 */
async function acessarBaseDeDados() {
  logar("Entrou no acessarBaseDeDados");

  logar("glbFluxo em acessarBaseDeDados: " + glbFluxo);
  // Obtem informaçoes necessárias ao agendamento
  if (glbFluxo &&
      glbFluxo === "AGENDAR") {
    //
    let paciente = null;
    if (glbInformacoesExtraidas.pacientes[0]) {
      paciente = glbInformacoesExtraidas.pacientes[0];
    }

    if (paciente &&
        paciente.convenio) {
      const unidadesConvenios =
        await selecionarUnidadesAtendemConvenio(paciente.convenio);

      // Avisa ao sistema quais unidades atendem o convenio do paciente
      glbHistoricoDaConversa.push({role: "system", content: "As unidades " +
        "que aceitam o convênio " + paciente.convenio +
        " estão no JSON 'unidadesConvenios' a seguir: " +
        JSON.stringify(unidadesConvenios)});
    }

    if (paciente &&
        paciente.convenio &&
        paciente.motivacao &&
        paciente.exames) {
      // Seleciona horarios disponíveis
      const horariosDisponiveis = await selecionarHorariosDisponiveis();

      // Avisa ao sistema sobre o JSON horariosDisponiveis
      glbHistoricoDaConversa.push({role: "system", content: "Os horários " +
      "disponíveis para as unidades que aceitam o convênio, a " +
      "subespecialidade e os exames simultaneamente estão no " +
      "JSON 'horariosDisponiveis' a seguir: " +
      JSON.stringify(horariosDisponiveis)});
    }
  }

  // Obtem informaçoes necessárias ao cancelamento
  if (glbFluxo &&
      glbFluxo === "CANCELAR") {
    //
    // Seleciona consultas agendadas
    const consultasAgendadas =
      await selecionarConsultasAgendadas();

    if (consultasAgendadas) {
    // Avisa ao sistema sobre o JSON consultasAgendadas
      glbHistoricoDaConversa.push({role: "system", content: "As consultas " +
      "agendadas estao no JSON 'consultasAgendadas' a seguir: " +
      JSON.stringify(consultasAgendadas)});
    } else {
      glbHistoricoDaConversa.push({role: "system", content: "Não há " +
        "consultas agendadas no JSON 'consultasAgendadas'."});
    }
  }

  if (glbFluxo &&
      glbFluxo === "REAGENDAR") {
    // Processa etapas
    if ((glbEtapa === "REAGENDAR 1 CONSULTA") ||
        (glbEtapa === "SELECIONAR CONSULTA A REAGENDAR")) {
      //
      salvarConsultaACancelarNoReagend();
    } else {
      //
      let paciente = null;
      if (glbInformacoesExtraidas.pacientes[0]) {
        paciente = glbInformacoesExtraidas.pacientes[0];
      }

      if (paciente &&
          paciente.convenio) {
        const unidadesConvenios =
        await selecionarUnidadesAtendemConvenio(paciente.convenio);

        // Avisa ao sistema quais unidades atendem o convenio do paciente
        glbHistoricoDaConversa.push({role: "system", content: "As unidades " +
          "que aceitam o convênio " + paciente.convenio +
          "estão no JSON 'unidadesConvenios' a seguir: " +
          JSON.stringify(unidadesConvenios)});
      }

      // Seleciona consultas agendadas
      const consultasAgendadas =
      await selecionarConsultasAgendadas();
      // Seleciona horarios disponíveis
      const horariosDisponiveis = await selecionarHorariosDisponiveis();

      if (consultasAgendadas) {
      // Avisa ao sistema sobre o JSON consultasAgendadas
        glbHistoricoDaConversa.push({role: "system", content: "As consultas " +
        "agendadas estao no JSON 'consultasAgendadas' a seguir: " +
        JSON.stringify(consultasAgendadas) +
        "\n\nOs horários disponíveis para as unidades que aceitam " +
        "o convênio, a subespecialidade e os exames simultaneamente " +
        "estão no JSON 'horariosDisponiveis' a seguir: " +
        JSON.stringify(horariosDisponiveis)});
      } else {
        glbHistoricoDaConversa.push({role: "system", content: "Não há " +
          "consultas agendadas no JSON 'consultasAgendadas'."});
      }
    }
  }
  return glbHistoricoDaConversa;
}

// **************************************************************
// Atualiza Convenio nas informações extraidas
// **************************************************************
/**
 * @async
 * @function atualizarConvenio
 * @return {Promise<Object|null>} - Retorna um objeto JSON com os detalhes
 * extraídos
 */
async function atualizarConvenio() {
  logar("Entrou no atualizarConvenio");

  const auxConvenio = await agenteConvenio();
  logar("auxConvenio: " + JSON.stringify(auxConvenio));

  // Cria um array com todos os convênios válidos (chaves do JSON)
  const conveniosLista = Object.keys(glbConfiguracoes.convenios);
  logar("conveniosLista: " + JSON.stringify(conveniosLista));

  if (glbInformacoesExtraidas && glbInformacoesExtraidas.pacientes &&
      glbInformacoesExtraidas.pacientes.length > 0 &&
      conveniosLista.includes(auxConvenio)) {
    // auxConvenio !== "ConvenioNaoEncontrado") {
    //
    glbInformacoesExtraidas.pacientes.forEach((paciente) => {
      paciente.convenio = auxConvenio;
    });
  }
  return glbInformacoesExtraidas;
}
// **************************************************************
// Extrai o nome do paciente, data e hora de agendamento do histórico da
// conversa usando o modelo da OpenAI.
// **************************************************************
/**
 * @async
 * @function agenteExtracaoInfConversa
 * @return {Promise<Object|null>} - Retorna um objeto JSON com os detalhes
 * extraídos
 */
async function agenteExtracaoInfConversa() {
  logar("Entrou no agenteExtracaoInfConversa");
  const dbRef = admin.database();

  // Define o prompt que será enviado ao modelo da OpenAI para extração das
  // informações
  const configuracoesSnapshot = await dbRef.
      ref("/DRM/agendamentoWhatsApp/configuracoes").once("value");

  let prompt = configuracoesSnapshot.val()
      .definicoesIA.agenteExtracaoInfConversa.definicao;

  // // Adiciona os convenios
  // const convenios = configuracoesSnapshot.val().convenios;
  // prompt = prompt +
  //   " \n\n O JSON 'convenios' é: " + JSON.stringify(convenios);

  // Adiciona os exames
  const exames = configuracoesSnapshot.val().exames;
  prompt = prompt +
    " \n\n O JSON 'exames' é: " + JSON.stringify(exames);

  const today = new Date();
  today.setHours(today.getHours()-3);
  logar("today: " + JSON.stringify(today));


  prompt = prompt + `\n\nHistórico da conversa:
    ${glbHistoricoDaConversa.map((msg) => `${msg.role === "user" ? "Usuário" :
      "Assistente"}: ${msg.content}`).join("\n")}
      \n Considere que hoje e agora é : \n\n${today}
  `;

  try {
    // Envia o prompt para a API da OpenAI
    const contentSystem = "Você é um assistente que extrai informações" +
      "específicas de um texto.";
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {role: "system", content: contentSystem},
        {role: "user", content: prompt},
      ],
    });

    // Extrai o conteúdo da resposta do assistente
    let rawContent = response.choices[0].message.content;

    // Remove delimitadores como ```json ou ```
    rawContent = rawContent.replace(/```json|```/g, "").trim();

    // Faz o parsing da resposta como JSON
    glbInformacoesExtraidas = JSON.parse(rawContent);
    glbInformacoesExtraidas.telefone = glbPhone;
    logar("glbInformacoesExtraidas apos parse: " +
      JSON.stringify(glbInformacoesExtraidas));

    // Obter convenio a partir da conversa
    glbInformacoesExtraidas = await atualizarConvenio();

    // Salva último JSON
    if (glbInformacoesExtraidas) {
      dbRef.ref("/DRM/agendamentoWhatsApp/operacional/conversas/" +
          glbPhone + "/ultimoJSON/")
          .set(glbInformacoesExtraidas);
    }

    // Retorna os dados extraídos
    return glbInformacoesExtraidas;
  } catch (error) {
    // Loga o erro para depuração
    console.error("Erro ao extrair detalhes com OpenAI:", error.message);

    // Retorna null em caso de erro
    return null;
  }
}

// **************************************************************
// Extrai os convênios e as subespecialidades por unidades.
// **************************************************************
/**
 * @async
 * @function selecionarConsultasAgendadas
 * @return {Promise<Object>} - Retorna os nomes das unidades que
 * atendem aos critérios no formato JSON
 */
async function selecionarConsultasAgendadas() {
  logar("Entrou no selecionarConsultasAgendadas");
  logar("glbInformacoesExtraidas.telefone: " + glbInformacoesExtraidas.telefone,
      glbPhone);
  const db = admin.database();
  const consultasAgendadasSnapshot = await db
      .ref("/DRM/agendamentoWhatsApp/operacional/consultasAgendadas/telefones/"+
        glbInformacoesExtraidas.telefone)
      .once("value");
  const consultasAgendadas = consultasAgendadasSnapshot.val();
  logar("consultasAgendadas: " + JSON.stringify(consultasAgendadas));
  let futureConsultas = {};
  if (consultasAgendadas) {
    // Obtem data e hora de agora
    const now = new Date();
    now.setHours(now.getHours()-3);

    // Obtem data de agora (sem horas)
    const today = new Date();
    today.setHours(today.getHours()-3);
    today.setHours(0, 0, 0, 0);

    futureConsultas = Object.entries(consultasAgendadas)
        .reduce((result, [date, times]) => {
          const dateParts = date.split("-");
          const appointmentDate = new Date(
              parseInt(dateParts[0]),
              parseInt(dateParts[1]) - 1, // Mês é indexado em 0
              parseInt(dateParts[2]),
          );

          if (appointmentDate >= today) {
            const validTimes = Object.entries(times)
                .filter(([time, details]) => {
                  const [hours, minutes] = time.split(":");
                  const appointmentTime = new Date(appointmentDate);
                  appointmentTime.setHours(parseInt(hours), parseInt(minutes));
                  return (appointmentTime >= now && !(details.cancelado));
                });

            if (validTimes.length > 0) {
              result[date] = Object.fromEntries(validTimes);
            }
          }

          return result;
        }, {});
  }
  return {futureConsultas};
}

/**
 * Função para converter uma string no formato "2aFeira10:00"
 * em uma data no formato "YYYY-MM-DD", considerando o fuso horário de Brasília
 * e garantindo uma diferença mínima de 3 horas entre o horário atual e o
 * horário da entrada.
 *
 * @function proximaData
 * @param {string} entrada - String no formato "2aFeira10:00".
 * @param {string} dataReferencia - Data no formato "aaaa-mm-dd" a partir da
 * qual calcular.
 * @return {string|null} - Data no formato "YYYY-MM-DD" ou null se não for
 * possível atender aos critérios.
 */
function proximaData(entrada, dataReferencia) {
  const diasDaSemana = {
    "2aFeira": 1, // Segunda-feira
    "3aFeira": 2, // Terça-feira
    "4aFeira": 3, // Quarta-feira
    "5aFeira": 4, // Quinta-feira
    "6aFeira": 5, // Sexta-feira
    "Sabado": 6, // Sábado
    "Domingo": 0, // Domingo
  };

  const fusoBrasilia = -3; // UTC-3

  // Extrair o dia da semana e o horário da string de entrada
  const diaSemanaString =
    entrada.slice(0, entrada.indexOf("a") + 6) || entrada.slice(0, 6);
  const horario = entrada.slice(entrada.indexOf("a") + 6);

  const diaSemana = diasDaSemana[diaSemanaString];
  if (diaSemana === undefined || !horario) return null;

  const [hora, minuto] = horario.split(":").map(Number);

  // Verificar e ajustar a data de referência
  let referencia = new Date();
  if (dataReferencia) {
    const tentativaReferencia = new Date(dataReferencia);
    if (!isNaN(tentativaReferencia.getTime())) {
      referencia = tentativaReferencia;
    }
  }

  // Ajustar o fuso horário para Brasília
  const referenciaBrasilia =
    new Date(referencia.getTime() + fusoBrasilia * 60 * 60 * 1000);

  // Ajustar o dia da semana para o próximo horário disponível
  const proximaData = new Date(referenciaBrasilia);
  proximaData.setHours(0, 0, 0, 0); // Zerar o horário
  // Ajustar para o próximo dia da semana
  proximaData.setDate(proximaData.getDate() +
    ((7 + diaSemana - proximaData.getDay()) % 7));
  proximaData.setHours(hora, minuto, 0, 0);

  // Verificar se há pelo menos 3 horas de diferença
  const diferencaHoras = (proximaData - referenciaBrasilia) / (1000 * 60 * 60);
  if (diferencaHoras < 3) {
    proximaData.setDate(proximaData.getDate() + 7); // Ajustar p/ sem. seguinte
  }

  // Retornar a data no formato "YYYY-MM-DD"
  const ano = proximaData.getUTCFullYear();
  const mes = String(proximaData.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(proximaData.getUTCDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

// **************************************************************
// Função para verificar se todos os itens da lista estão assinalados
// como "Sim" no JSON.
// **************************************************************
/**
 * @function verificarSeAtendeTudo
 * @param {Object} jsonData - Objeto JSON contendo os dados.
 * @param {Array} listaCriterios - Lista de criterios a serem verificados.
 * @return {boolean} - Retorna true se todos os itens da lista forem "Sim",
 * caso contrário false.
 */
function verificarSeAtendeTudo(jsonData, listaCriterios) {
  return listaCriterios.every((criterio) =>
    jsonData[criterio] &&
    jsonData[criterio].toLowerCase() === "sim");
}

// **************************************************************
//  * Função para transformar uma string:
//  * - Converter para minúsculas
//  * - Remover acentos
//  * - Remover espaços
// **************************************************************
// /**
//  * @function transfStr
//  * @param {string} inputString - A string de entrada.
//  * @return {string} - A string transformada.
//  */
// function transfStr(inputString) {
//   return inputString
//    .toLowerCase() // Converter para minúsculas
//    .normalize("NFD") // Normaliza string p/ decompor os caracteres acentuados
//    .replace(/[\u0300-\u036f]/g, "") // Remover marcas diacríticas (acentos)
//    .replace(/\s+/g, ""); // Remover espaços
// }

// **************************************************************
// * Função para filtrar horários disponíveis com base na quantidade
// necessária de agendamentos consecutivos com intervalo de N minutos
// **************************************************************
/**
 * @function filtrarHorariosParaNPessoas
 * @param {Object} horariosJson - JSON contendo unidades, datas e horários.
 * @param {number} pessoasNecessarias - Quantidade de pessoas que necessitam de
 * agendamento consecutivo.
 * @return {Object} - JSON contendo apenas os horários disponíveis que
 * atendem ao requisito.
 */
function filtrarHorariosParaNPessoas(horariosJson, pessoasNecessarias) {
  logar("Entrou no filtrarHorariosParaNPessoas");

  const horariosFiltrados = {};

  Object.keys(horariosJson).forEach((unidade) => {
  // for (const unidade in horariosJson) {
    const datas = horariosJson[unidade];
    Object.keys(datas).forEach((data) => {
    // for (const data in datas) {
      const horarios = Object.keys(datas[data])
          .sort((a, b) => {
            const [h1, m1] = a.split(":").map(Number);
            const [h2, m2] = b.split(":").map(Number);
            return h1 * 60 + m1 - (h2 * 60 + m2);
          });

      for (let i = 0; i < horarios.length; i++) {
        let atendem = true;
        const horariosParaPessoas = [];

        for (let j = 0; j < pessoasNecessarias; j++) {
          const horarioAtual = horarios[i + j];
          if (!horarioAtual || !datas[data][horarioAtual]) {
            atendem = false;
            break;
          }

          const [h1, m1] = horarioAtual.split(":").map(Number);
          const anterior = horarios[i + j - 1];
          const [h2, m2] =
            anterior ? anterior.split(":").map(Number) : [h1, m1 - 60];

          if (j > 0 && (h1 * 60 + m1) - (h2 * 60 + m2) !== 30) {
            atendem = false;
            break;
          }

          horariosParaPessoas.push(horarioAtual);
        }

        if (atendem) {
          if (!horariosFiltrados[unidade]) horariosFiltrados[unidade] = {};
          if (!horariosFiltrados[unidade][data]) {
            horariosFiltrados[unidade][data] = {};
          }

          horariosParaPessoas.forEach((horario) => {
            horariosFiltrados[unidade][data][horario] = true;
          });
        }
      }
    });
  });

  return horariosFiltrados;
}
// **************************************************************
// Função auxiliar para verificar se um horário está dentro de
// uma faixa de tempo
// **************************************************************
/**
  * @function isHoraDentroFaixa
  * @param {string} horario - horario
  * @param {string} inicio - inicio
  * @param {string} fim - fim
  * @return {boolean} - se um horário está dentro de uma faixa de tempo
*/
function isHoraDentroFaixa(horario, inicio, fim) {
  const [hora, minuto] = horario.split(":").map(Number);
  const [horaInicio, minutoInicio] = inicio.split(":").map(Number);
  const [horaFim, minutoFim] = fim.split(":").map(Number);

  const horaAtual = hora * 60 + minuto;
  const horaInicioMin = horaInicio * 60 + minutoInicio;
  const horaFimMin = horaFim * 60 + minutoFim;

  return horaAtual >= horaInicioMin && horaAtual <= horaFimMin;
}

// **************************************************************
// Filtra horarios bloqueados
// **************************************************************
/**
  * @async
  * @function filtrarHorariosBloqueados
  * @param {Object} horariosDisponiveis - horariosDisponiveis
  * @return {Promisse<Object>} - Retorna os horários que
  * atendem aos critérios no formato JSON
*/
async function filtrarHorariosBloqueados(horariosDisponiveis) {
  logar("Entrou filtrarHorariosBloqueados");
  const dbRef = admin.database();
  let resultado = {};

  const datasBloqueadasSnapshot = await dbRef
      .ref("/DRM/agendamentoWhatsApp/configuracoes/datasBloqueadas")
      .once("value");

  const horariosBloqueados = datasBloqueadasSnapshot.val();
  if (horariosBloqueados) {
    // Clonando o JSON de horários disponíveis para edição
    resultado = JSON.parse(JSON.stringify(horariosDisponiveis));

    // Iterando sobre os locais de horários bloqueados
    for (const [local, datasBloqueadas] of Object.entries(horariosBloqueados)) {
      // Verifica se local existe nos horários disponíveis
      if (resultado[local]) {
        for (const [data, detalhesBloqueio] of
          Object.entries(datasBloqueadas)) {
          // Verificar se a data existe nos horários disponíveis
          if (resultado[local][data]) {
            const {horarioInicio, horarioFim} = detalhesBloqueio;

            // Filtrando os horários disponíveis para essa data
            resultado[local][data] = Object.fromEntries(
                Object.entries(resultado[local][data]).filter(([horario]) => {
                  return !isHoraDentroFaixa(horario, horarioInicio, horarioFim);
                }),
            );

            // Removendo a data do JSON se todos os horários forem filtrados
            if (Object.keys(resultado[local][data]).length === 0) {
              delete resultado[local][data];
            }
          }
        }

        // Removendo o local do JSON se todas as datas forem removidas
        if (Object.keys(resultado[local]).length === 0) {
          delete resultado[local];
        }
      }
    }
  } else {
    return horariosDisponiveis;
  }

  return resultado;
}

// **************************************************************
// Filtra Feriados
// **************************************************************
/**
  * @async
  * @function filtrarFeriados
  * @param {Object} horariosDisponiveis - horariosDisponiveis
  * @return {Promisse<Object>} - Retorna os horários que
  * atendem aos critérios no formato JSON
*/
async function filtrarFeriados(horariosDisponiveis) {
  logar("Ëntrou filtrarFeriados");
  const dbRef = admin.database();
  // Filtro de feriados
  const feriadosSnapshot = await dbRef.
      ref("DRM/agendamentoWhatsApp/configuracoes/feriados").once("value");
  const feriados = feriadosSnapshot.val();
  const feriadosSet = new Set(Object.values(feriados)
      .map((f) => new Date(f.data).toISOString().split("T")[0]));

  const horariosSemFeriados = {};
  Object.entries(horariosDisponiveis).forEach(([unidade, dias]) => {
    horariosSemFeriados[unidade] = {};
    Object.entries(dias).forEach(([dia, horarios]) => {
      if (!feriadosSet.has(dia)) {
        horariosSemFeriados[unidade][dia] = horarios;
      }
    });
  });
  return horariosSemFeriados;
}

// **************************************************************
// Adiciona Dias da Semana ao JSON
// **************************************************************
/**
  * @async
  * @function adicionarDiasSemana
  * @param {Object} horariosDisponiveis - horariosDisponiveis
  * @return {Object} - Retorna os horários que
  * atendem aos critérios no formato JSON
*/
async function adicionarDiasSemana(horariosDisponiveis) {
  logar("Entrou adicionarDiasSemana");
  // Adicionar os dias da semana ao JSON
  const diasSemana = [
    "Domingo", "2aFeira", "3aFeira",
    "4aFeira", "5aFeira", "6aFeira", "Sabado"];

  const horariosDisponiveisDiaSemana = {};

  Object.entries(horariosDisponiveis).forEach(([unidade, datas]) => {
    horariosDisponiveisDiaSemana[unidade] = {};

    Object.entries(datas).forEach(([data, horarios]) => {
      const [ano, mes, dia] = data.split("-").map(Number);
      const date = new Date(ano, mes - 1, dia); // Cria objeto Date
      const diaSemana = diasSemana[date.getDay()]; // Obtém o dia da semana

      const chaveComDiaSemana = `${data} ${diaSemana}`;
      horariosDisponiveisDiaSemana[unidade][chaveComDiaSemana] = horarios;
    });
  });

  return horariosDisponiveisDiaSemana;
}

// **************************************************************
// filtrarHorariosPorParticular
// **************************************************************
/**
* @async
  * @function filtrarHorariosPorParticular
  * @param {Object} horariosDisponiveis - horariosDisponiveis
  * @param {Object} consultasAgendadasPorUnidade - consultasAgendadas
  * @return {Promise<Object>} - Retorna os horários que
  * atendem aos critérios no formato JSON
*/
async function filtrarHorariosPorParticular(horariosDisponiveis,
    consultasAgendadasPorUnidade) {
  logar("Entrou filtrarHorariosPorParticular");
  const dbRef = admin.database();
  const unidadesSnapshot = await dbRef
      .ref("/DRM/agendamentoWhatsApp/configuracoes/unidades").once("value");
  const unidades = unidadesSnapshot.val();
  const resultado = JSON.parse(JSON.stringify(horariosDisponiveis));

  if (consultasAgendadasPorUnidade) {
    for (const [unidade, diasAgendados] of
      Object.entries(consultasAgendadasPorUnidade)) {
      if (unidades[unidade]) {
        const limiteParticulares = unidades[unidade].qtdParticularDia;

        for (const [data, horarios] of Object.entries(diasAgendados)) {
          let countParticulares = 0;

          for (const [, consulta] of Object.entries(horarios)) {
            if (consulta.convenio === "Particular") {
              countParticulares++;
            }
          }

          // Remove a data do JSON de horários disponíveis se atingir ou
          // exceder o limite de particulares
          if (countParticulares >= limiteParticulares) {
            if (resultado[unidade] && resultado[unidade][data]) {
              delete resultado[unidade][data];

              // Remove a unidade caso não tenha mais datas disponíveis
              if (Object.keys(resultado[unidade]).length === 0) {
                delete resultado[unidade];
              }
            }
          }
        }
      }
    }
  } else {
    return horariosDisponiveis;
  }

  return resultado;
}

// **************************************************************
// Agente que identifica a subespecialidade a partir de motivação
// **************************************************************
/**
/**
  * @async
  * @function agenteSubespecialidade
  * @param {Array} motivacoes - motivacoes
  * @return {Array} Retorna subespecialidade
  *
*/
async function agenteSubespecialidade(motivacoes) {
  logar("Entrou agenteSubespecialidade");

  const dbRef = admin.database();
  const subespecialidadeSnapshot = await dbRef
      .ref("/DRM/agendamentoWhatsApp/configuracoes/subespecialidades")
      .once("value");
  const objSubespecialidades = subespecialidadeSnapshot.val();
  const subespecialidades = [];

  Object.entries(objSubespecialidades).forEach(([keySubesp, valueSubesp]) => {
    if (!subespecialidades.includes(keySubesp)) {
      subespecialidades.push(keySubesp);
    }
  });

  const configuracoesSnapshot = await dbRef.
      ref("/DRM/agendamentoWhatsApp/configuracoes").once("value");
  let prompt = configuracoesSnapshot.val()
      .definicoesIA.agenteSubespecialidade.definicao;

  prompt = prompt +
    `\n\nAs motivacoes/queixas do paciente são: ${motivacoes} 
    O JSON de subespecialidades possiveis é: ${subespecialidades}`;

  let rawContent = await chamarOpenAI(prompt);

  // Remove delimitadores como ```json ou ```
  rawContent = rawContent.replace(/```json|```/g, "").trim();

  // Faz o parsing da resposta como JSON
  const result = JSON.parse(rawContent);
  return result;
}

// **************************************************************
// Ordena JSON das datas mais recentes para as mais distantes
// **************************************************************
/**
* @async
  * @function ordenarJsonPorData
  * @param {Object} horariosDisponiveis - horariosDisponiveis
  * @return {Promise<Object>} - Retorna os horários que
  * atendem aos critérios no formato JSON
*/
async function ordenarJsonPorData(horariosDisponiveis) {
  logar("Entrou no ordenarJsonPorData");
  // function sortDatesPerUnit(scheduleJson) {
  const scheduleJson = horariosDisponiveis;
  const sortedSchedule = {};

  const unidades = Object.keys(scheduleJson);
  unidades.forEach((unidade) => {
    const datas = Object.keys(scheduleJson[unidade]);

    // Filtra datas válidas (formato YYYY-MM-DD) e ignora as inválidas
    // (ex: "null undefined")
    const datasValidas = datas.filter((dataCompleta) =>
      /^\d{4}-\d{2}-\d{2}/.test(dataCompleta));

    // Ordena as datas do mais recente para o mais distante
    const datasOrdenadas = datasValidas.sort((a, b) => {
      const dataA = new Date(a.split(" ")[0]);
      const dataB = new Date(b.split(" ")[0]);
      return dataA - dataB; // crescente
    });

    // Cria novo objeto ordenado
    const agendaOrdenada = {};
    for (const data of datasOrdenadas) {
      agendaOrdenada[data] = scheduleJson[unidade][data];
    }

    // Inclui datas inválidas ao final (opcional)
    const datasInvalidas = datas.filter((data) => !datasValidas.includes(data));
    for (const data of datasInvalidas) {
      agendaOrdenada[data] = scheduleJson[unidade][data];
    }

    sortedSchedule[unidade] = agendaOrdenada;
  });

  return sortedSchedule;
}
// **************************************************************
// Seleciona horarios disponíveis (modificado)
// **************************************************************
/**
* @async
  * @function selecionarHorariosDisponiveis
  * @return {Promise<Object>} - Retorna os horários que
  * atendem aos critérios no formato JSON
*/
async function selecionarHorariosDisponiveis() {
  logar("Entrou no selecionarHorariosDisponiveis");
  const dbRef = admin.database();

  let outraData = null;
  if (glbInformacoesExtraidas.outraData) {
    outraData = glbInformacoesExtraidas.outraData;
  } else {
    outraData = glbInformacoesExtraidas.dataAgendada;
  }
  logar("outraData: " + outraData);

  const criterios = [];
  const motivacoes = [];

  glbInformacoesExtraidas.pacientes.forEach((paciente) => {
    if ( paciente.exames) {
      paciente.exames.forEach((exame) => {
        if (!criterios.includes(exame) && exame) {
          criterios.push(exame);
        }
      });
    }
    if (!motivacoes.includes(paciente.motivacao) && paciente.motivacao) {
      motivacoes.push(paciente.motivacao);
    }
    if (!criterios.includes(paciente.convenio) && paciente.convenio) {
      criterios.push(paciente.convenio);
    }
  });

  const subespecialidades = await agenteSubespecialidade(motivacoes);
  logar("motivacoes: " + JSON.stringify(motivacoes));
  logar("subespecialidades: " + JSON.stringify(subespecialidades));
  subespecialidades.forEach((subespecialidade) => {
    if (!criterios.includes(subespecialidade)) {
      criterios.push(subespecialidade);
    }
  });

  // criterios.push(paciente.convenio);
  logar("criterios: " + JSON.stringify(criterios));
  try {
  // Busca o JSON completo de horários no Firebase
    const unidadesHorariosSnapshot = await dbRef
        .ref("/DRM/agendamentoWhatsApp/configuracoes/horarios")
        .once("value");
    const unidadesHorarios = unidadesHorariosSnapshot.val();
    // Busca o JSON de consultas agendadas de todas as unidades no Firebase
    const unidadesConsultasAgSnapshot = await dbRef
        .ref("/DRM/agendamentoWhatsApp/operacional/consultasAgendadas/" +
        "unidades")
        .once("value");

    const unidadesConsultasAg = unidadesConsultasAgSnapshot.val();
    const filteredData = {};


    // Itera sobre cada unidadeHorario
    Object.entries(unidadesHorarios).forEach(([keyUnid, valueUnidHorarios]) => {
      const unidade = keyUnid;
      const horarios = valueUnidHorarios;

      let consultasUnid = {};

      if (unidadesConsultasAg) {
        consultasUnid = unidadesConsultasAg[unidade];
      }

      Object.entries(horarios).forEach(([keyDiaHora, valueDiaHoraCrit]) => {
        const atendeTudo = verificarSeAtendeTudo(valueDiaHoraCrit, criterios);

        if (atendeTudo) {
          const hora = keyDiaHora.match(/\d{2}:\d{2}/);
          const datas = [proximaData(keyDiaHora, outraData)];

          if (hora) {
            datas.forEach((strData) => {
              if (!filteredData[unidade]) filteredData[unidade] = {};
              if (!filteredData[unidade][strData]) {
                filteredData[unidade][strData] = {};
              }

              // Adiciona o objeto filtrado se o horário estiver livre
              if (
                !consultasUnid ||
                !consultasUnid[strData] ||
                !consultasUnid[strData][hora]
              ) {
                filteredData[unidade][strData][hora] = true;
              }
            });
          }
        }
      });
    });

    // -------------------------------------------------------------------------
    const quantidade = glbInformacoesExtraidas.pacientes.length;

    let horariosDisponiveis =
        filtrarHorariosParaNPessoas(filteredData, quantidade);
    // -------------------------------------------------------------------------
    horariosDisponiveis = await filtrarFeriados(horariosDisponiveis);
    // -------------------------------------------------------------------------
    horariosDisponiveis = await filtrarHorariosBloqueados(horariosDisponiveis);
    // -------------------------------------------------------------------------
    horariosDisponiveis = await filtrarHorariosPorParticular(
        horariosDisponiveis, unidadesConsultasAg);
    // -------------------------------------------------------------------------
    horariosDisponiveis = await adicionarDiasSemana(horariosDisponiveis);
    // -------------------------------------------------------------------------
    horariosDisponiveis = await ordenarJsonPorData(horariosDisponiveis);
    // -------------------------------------------------------------------------

    logar("horariosDisponiveis: " + JSON.stringify(horariosDisponiveis),
        glbPhone);

    return {horariosDisponiveis};
  } catch (error) {
    console.error("Erro ao buscar horários disponíveis:", error.message);
    return {horariosDisponiveis: ["não há horários disponíveis"]};
  }
}

// **************************************************************
// Salva os dados o histórico no firebase com data mais recente
//  e apaga do firestrore
// **************************************************************
/**
* @async
* @function apagarHistorico
*/
async function apagarHistorico() {
  logar("Entrou em apagarHistorico");

  let dataMaisRecente = null;
  if (glbHistoricoDaConversa) {
    // obter a data mais recente a partir do historico da conversa
    dataMaisRecente = await obterDataMaisRecente();

    // salvar no firebase e apagar do firestore
    await apagarHistoricoNaBD(dataMaisRecente);
  }
}

// **************************************************************
// Salva no firebase o histórico das conversas e apaga do firestrore
// **************************************************************
/**
  * @async
  * @function apagarHistoricoNaBD
  * @param {Object} dataMaisRecente - dataMaisRecente
*/
async function apagarHistoricoNaBD(dataMaisRecente) {
  logar("Entrou em apagarHistoricoNaBD");

  if (dataMaisRecente && dataMaisRecente.isValid()) {
    // salvar no firebase
    const dbRef = admin.database().
        ref("DRM/agendamentoWhatsApp/operacional/conversas/" +
          glbPhone + "/conversasAntigas/" +
          (dataMaisRecente.format("YYYY-MM-DD-HH:mm")) +
          "/historico");

    dbRef.set(glbHistoricoDaConversa);

    admin.firestore().collection("historicoDaConversa")
        .doc(glbPhone).delete();
  } else {
    logar("Nenhuma data válida encontrada" +
      " no histórico da conversa.");
  }
}


// **************************************************************
// Obtem a data mais recente do histórico da conversa
// **************************************************************
/**
/**
  * @async
  * @function obterDataMaisRecente
  * @return {Object} Retorna um objeto Moment.js da data/hora mais recente
  *
*/
async function obterDataMaisRecente() {
  logar("Entrou em obterDataMaisRecente");

  let dataMaisRecente = null;
  const moment = require("moment");

  glbHistoricoDaConversa.forEach((entry) => {
    const content = entry.content;

    // Regex para encontrar datas no formato "Fri Jan 17 2025 16:30:25"
    const regex = new RegExp("Considere que hoje e agora é:\\s*\\n\\n(" +
    "[A-Za-z]{3} [A-Za-z]{3} \\d{1,2} \\d{4} \\d{2}:\\d{2}:\\d{2})", "g");
    let match;

    while ((match = regex.exec(content)) !== null) {
      const dateString = match[1];

      const parsedDate =
        moment(dateString, "ddd MMM DD YYYY HH:mm:ss", true);
      if (!dataMaisRecente || parsedDate.isAfter(dataMaisRecente)) {
        dataMaisRecente = parsedDate;
      }
    }
  });
  return dataMaisRecente;
}

// **************************************************************
// 🔹 Agente 1: Atendimento - Identifica intenção do paciente
// **************************************************************
/**
/**
  * @async
  * @function agenteFluxo
  * @return {Object} Retorna AGENDAR ou CANCELAR
  *
*/
async function agenteFluxo() {
  logar("Entrou agenteFluxo");

  let fluxo = "INDETERMINADA";
  if (glbHistoricoDaConversa.length >= 2) {
    const ult = glbHistoricoDaConversa.length - 1;
    const penult = glbHistoricoDaConversa.length - 2;
    let ultMsgOpenAI;
    if (glbHistoricoDaConversa[ult].role === "assistant") {
      ultMsgOpenAI = glbHistoricoDaConversa[ult].content;
    } else if (glbHistoricoDaConversa[penult].role === "assistant") {
      ultMsgOpenAI = glbHistoricoDaConversa[penult].content;
    }
    const db = admin.database();
    const configuracoesSnapshot = await db.
        ref("/DRM/agendamentoWhatsApp/configuracoes").once("value");
    let prompt = configuracoesSnapshot.val()
        .definicoesIA.agenteFluxo.definicao;

    prompt = `Você é uma atendente virtual do Dr. Melo.
    Voce disse: "${ultMsgOpenAI}". O paciente disse: "${glbMessage}".
    \n\n` + prompt;
    fluxo = await chamarOpenAI(prompt);
  }
  return fluxo;
}

// **************************************************************
// Função auxiliar para chamar a OpenAI
// **************************************************************
/**
/**
  * @async
  * @function chamarOpenAI
  * @param {string} prompt - prompt
  * @return {Object} Retorna resultado da chamada a OpenAI
  *
*/
async function chamarOpenAI(prompt) {
  logar("Entrou chamarOpenAI");
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{role: "system", content: prompt}],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Erro ao chamarOpenAI:", error.message);
    return "Peço desculpas, não consegui entender sua mensagem. " +
    "Poderia repetir, por favor?";
  }
}

// **************************************************************
// Agente que identifica a etapa que a conversa esta
// **************************************************************
/**
  * @async
  * @function agenteEtapa
  * @return {Object} Retorna AGENDAR ou CANCELAR
  *
*/
async function agenteEtapa() {
  logar("Entrou agenteEtapa");

  let auxEtapa = "INDETERMINADA";
  if (glbHistoricoDaConversa.length >= 2) {
    const ult = glbHistoricoDaConversa.length - 1;
    const penult = glbHistoricoDaConversa.length - 2;
    let ultMsgOpenAI;
    if (glbHistoricoDaConversa[ult].role === "assistant") {
      ultMsgOpenAI = glbHistoricoDaConversa[ult].content;
    } else if (glbHistoricoDaConversa[penult].role === "assistant") {
      ultMsgOpenAI = glbHistoricoDaConversa[penult].content;
    }

    const db = admin.database();
    const configuracoesSnapshot = await db.
        ref("/DRM/agendamentoWhatsApp/configuracoes").once("value");

    const prompts = Object.values(configuracoesSnapshot.val()
        .definicoesIA3.agenteEtapa || []);
    let strContent = "";
    prompts.forEach((prompt) => {
      strContent = strContent + "\n\n " + prompt.definicao;
    });

    let prompt = strContent;
    // logar("prompt agenteEtapa: " + prompt);

    const promptInicial = `Você é uma atendente virtual do Dr. Melo.
    Voce disse: "${ultMsgOpenAI}". O paciente disse: "${glbMessage}".\n\n`;
    prompt = promptInicial + prompt;

    logar("promptInicial agenteEtapa: " + promptInicial);

    auxEtapa = await chamarOpenAI(prompt);
  }

  return auxEtapa;
}

// **************************************************************
// Obtem telefones das unidades
// **************************************************************
/**
  * @async
  * @function obterTelefonesUnidades
  * @return {Object} Retorna telefones das unidades
  *
*/
async function obterTelefonesUnidades() {
  logar("Entrou obterTelefonesUnidades");


  logar("glbConfiguracoes.unidades: " +
    JSON.stringify(glbConfiguracoes.unidades));
  // const unidades = unidadesSnapshot.val();
  const unidades = glbConfiguracoes.unidades;

  // Usa Object.keys() para pegar todas as unidades e seus respectivos telefones
  const telefonesUnidades =
    Object.keys(unidades).map((nomeUnidade) => unidades[nomeUnidade].whatsApp);

  return telefonesUnidades;
}


// **************************************************************
// Obtem telefones bloqueados que não podem conversar com a
// **************************************************************
/**
  * @async
  * @function obterTelefonesBloqueadosIA
  * @return {number[]}
  *
  * • Caminho no RTDB: /DRM/agendamentoWhatsApp/operacional/telBloqueadosIA
  * • Regras:
  *     – Se dataInicio/dataFim ausentes  → bloqueio indeterminado
*/
async function obterTelefonesBloqueadosIA() {
  //
  logar("Entrou obterTelefonesBloqueadosIA");

  const path = "/DRM/agendamentoWhatsApp/operacional/telBloqueadosIA/" +
  "19RhAFSoLsEBh-hQLkgOnw14lr6O08kEiWOHjCH2tIEA/telBloqueadosIA";

  const snapshot = await admin.database().ref(path).once("value");
  const bloqueios = snapshot.val() || {};
  const hoje = new Date();

  const telefonesBloqueados = Object.keys(bloqueios)
      .filter((tel) => {
        const {dataInicio, dataFim} = bloqueios[tel];

        const inicio = new Date(dataInicio);
        if (hoje < inicio) return false;

        if (!dataFim) return true;
        return hoje <= new Date(dataFim);
      })
      .map(Number);

  logar("Telefones bloqueados: " + JSON.stringify(telefonesBloqueados));
  return telefonesBloqueados;
}

// **************************************************************
// Atualizar buffer de mensagens
// **************************************************************
/**
  * @async
  * @function atualizarBufferMensagens
  * @return {string} Retorna mensagens do buffer concatenadas
  *
*/
async function atualizarBufferMensagens() {
  logar("Entrou atualizarBufferMensagens");

  const dbRef = admin.database();
  await dbRef.ref("/DRM/agendamentoWhatsApp/operacional/conversas/" +
    glbPhone + "/bufferMensagens").push(glbMessage);

  const bufferSnapshot = await dbRef
      .ref("/DRM/agendamentoWhatsApp/operacional/conversas/" + glbPhone +
      "/bufferMensagens")
      .once("value");
  const mensagens = Object.values(bufferSnapshot.val() || []);
  const msgConcatenada = mensagens.join(". ");
  const buffer = {
    qtdMsgs: mensagens.length,
    msgConcatenada: msgConcatenada,
  };
  return buffer;
}

// **************************************************************
// Ler buffer de mensagens
// **************************************************************
/**
  * @async
  * @function lerBufferMensagens
  * @return {string} Retorna mensagens do buffer concatenadas
  *
*/
async function lerBufferMensagens() {
  logar("Entrou lerBufferMensagens");

  const dbRef = admin.database();

  const bufferSnapshot = await dbRef
      .ref("/DRM/agendamentoWhatsApp/operacional/conversas/" + glbPhone +
      "/bufferMensagens")
      .once("value");

  const mensagens = Object.values(bufferSnapshot.val() || []);
  const msgConcatenada = mensagens.join(". ");
  const buffer = {
    qtdMsgs: mensagens.length,
    msgConcatenada: msgConcatenada,
  };
  return buffer;
}

// **************************************************************
// Faz o log no Google Cloud ou no rtDatabase, conforme parametrizado
// **************************************************************
/**
  * @function logar
  * @param {string} mensagem - mensagem
  *
*/
function logar(mensagem) {
  glbIndLog = glbIndLog + 1;
  if ((localLog === "rtDataBase") || (ambiente === "producao")) {
    updates["/DRM/agendamentoWhatsApp/operacional/conversas/" +
      glbPhone + "/log/" + glbAgora + "/" + glbIndLog] = mensagem;
  } else {
    console.log(mensagem);
  }
}

// **************************************************************
// Agente que identifica o convenio na conversa
// **************************************************************
/**
  * @async
  * @function agenteConvenio
  * @return {Object} Retorna o convenio
  *
*/
async function agenteConvenio() {
  logar("Entrou agenteConvenio");

  // const dbRef = admin.database();

  // Define o prompt que será enviado ao modelo da OpenAI para extração das
  // informações
  // const configuracoesSnapshot = await dbRef.
  //     ref("/DRM/agendamentoWhatsApp/configuracoes").once("value");

  // let prompt = configuracoesSnapshot.val()
  //     .definicoesIA.agenteConvenio.definicao;
  let prompt = glbConfiguracoes.definicoesIA.agenteConvenio.definicao;

  // Adiciona os convenios
  // const convenios = configuracoesSnapshot.val().convenios;
  const convenios = glbConfiguracoes.convenios;
  prompt = prompt +
    " \n\n O JSON 'convenios' é: " + JSON.stringify(convenios);

  const historicoSemPrimeiro = glbHistoricoDaConversa.slice(1);
  prompt = prompt + `\n\nHistórico da conversa:
    ${historicoSemPrimeiro.map((msg) => `${msg.role === "user" ? "Usuário" :
      "Assistente"}: ${msg.content}`).join("\n")}
  `;
  logar("prompt agenteConvenio: " + JSON.stringify(prompt));
  return await chamarOpenAI(prompt);
}

// **************************************************************
// Obtem Dados Iniciais
// **************************************************************
/**
  * @async
  * @function obterDadosIniciais
  *
*/
async function obterDadosIniciais() {
  logar("Entrou obterDadosIniciais");

  // Obter o histórico da conversa
  glbHistoricoDaConversa = await obterHistoricoDaConversa();

  // Obter etapa em que a conversa está
  glbEtapa = await agenteEtapa();

  // Adicionar a mensagem do usuário ao histórico
  glbHistoricoDaConversa.push({role: "user", content: glbMessage});

  // Usar a OpenAI para extrair os detalhes
  glbInformacoesExtraidas =
    await agenteExtracaoInfConversa();

  // Obtem informaçoes necessárias ao agendamento/cancelamento
  if (glbInformacoesExtraidas) {
    glbHistoricoDaConversa = await acessarBaseDeDados();
  }
}

// **************************************************************
// Endpoint para Webhook do WhatsApp - KatiaOriginal
// **************************************************************
app.post("/webhook", async (req, res) => {
  // Obtem timestamp atual
  const today = new Date();
  today.setHours(today.getHours()-3);
  glbAgora = JSON.stringify(today);
  glbAgora = glbAgora.replace(".", ":");

  // Obtem telefone e mensagem do paciente
  glbPhone = req.body.phone;

  logar("Entrou drmAtendimentoWAKatia");
  logar("req.body: " + JSON.stringify(req.body));

  const dbRef = admin.database();
  glbMessage = null;
  let reaction = null;
  let image = null;
  let video = null;
  let audio = null;
  let document = null;

  if (req.body.text && req.body.text.message) {
    glbMessage = req.body.text.message;
  }
  if (req.body.image && req.body.image.imageUrl) {
    image = req.body.image.imageUrl;
    logar("*********** image: " + image);
  }
  if (req.body.video && req.body.video.videoUrl) {
    video = req.body.video.videoUrl;
    logar("*********** video: " + video);
  }
  if (req.body.audio && req.body.audio.audioUrl) {
    audio = req.body.audio.audioUrl;
    logar("*********** audio: " + audio);
  }
  if (req.body.document && req.body.document.documentUrl) {
    document = req.body.document.documentUrl;
    logar("*********** document: " + document);
  }
  if (req.body.reaction) {
    reaction = req.body.reaction;
    logar("*********** reaction: " + reaction.value);
  }

  logar("*********** glbPhone: " + glbPhone);
  logar("*********** glbMessage: " + glbMessage);

  console.log("*********** glbPhone: " + glbPhone);
  console.log("*********** glbMessage: " + glbMessage);

  // Atualiza e obtem buffer de mensagens (em construcao ainda)
  const bufferInicio = await atualizarBufferMensagens();
  glbMessage = bufferInicio.msgConcatenada;
  logar("*********** msgConcatenada: " + glbMessage);

  // Le messageID para evitar conversas duplicadas
  const msgId = req.body.messageId;
  const ultimaMsgSnapshot = await dbRef
      .ref("/DRM/agendamentoWhatsApp/operacional/conversas/" + glbPhone +
      "/messageId/" + msgId)
      .once("value");
  const ultimaMsg = ultimaMsgSnapshot.val();
  logar("ultimaMsg: " + JSON.stringify(ultimaMsg));

  // Obtem configuracoes
  const configuracoesSnapshot = await dbRef
      .ref("/DRM/agendamentoWhatsApp/configuracoes/")
      .once("value");
  glbConfiguracoes = configuracoesSnapshot.val();

  // Obtem telefones das unidades
  const telefonesUnidades = await obterTelefonesUnidades();
  logar("Telefones das unidades: " + JSON.stringify(telefonesUnidades));

  // Obtem telefones que a IA não pode conversar
  const telefonesBloqueados = await obterTelefonesBloqueadosIA();
  logar("Telefones telefonesBloqueados: " +
    JSON.stringify(telefonesBloqueados));

  // let historicoDaConversa = {};
  if ((!ultimaMsg) && (!reaction) &&
      (!telefonesUnidades.includes(parseInt(glbPhone))) &&
      (!telefonesBloqueados.includes(parseInt(glbPhone)))) {
    //
    // ********* INICIO DO PROCESSAMENTO **********
    logar("Entrou if ultimaMsg");
    if (glbMessage) {
      // Salva messageID para evitar conversas duplicadas
      dbRef.ref("/DRM/agendamentoWhatsApp/operacional/conversas/" + glbPhone +
          "/messageId/" + msgId)
          .set(true);

      // Obter dados iniciais
      await obterDadosIniciais();

      // Processar a mensagem com OpenAI
      if (!glbInformacoesExtraidas) {
        // Usar a OpenAI para extrair os detalhes
        glbInformacoesExtraidas =
          await agenteExtracaoInfConversa();
      }
      const respostaIA = await agenteProcessarMensagem();

      // Aguarda 5 segundos e verifica se entrou outra mensagem no buffer
      await new Promise((resolve) => {
        setTimeout(() => {
          logar("Aguardou 5 segundos...");
          resolve();
        }, 5000);
      });
      const bufferFim = await lerBufferMensagens();
      logar("bufferFim.qtdMsgs: " + bufferFim.qtdMsgs);
      logar("bufferInicio.qtdMsgs: " + bufferInicio.qtdMsgs);

      // Se não entrou nova mensagem no buffer, prossegue
      if ((bufferFim) && (bufferFim.qtdMsgs === bufferInicio.qtdMsgs)) {
        // Exclui buffer
        await dbRef.ref("/DRM/agendamentoWhatsApp/operacional/conversas/" +
          glbPhone + "/bufferMensagens").remove();

        // Adicionar a resposta do assistente ao histórico
        glbHistoricoDaConversa.push({role: "assistant", content: respostaIA});

        // Salvar o histórico atualizado
        salvarHistoricoDaConversa();

        // Enviar a resposta ao usuário no WhatsApp
        drmEnviarMensagemWhatsApp(respostaIA);

        // Processa agendamentos e cancelamentos
        if (glbEtapa === "CONFIRMADO" ||
            glbEtapa === "CONFIRMADO REAGENDAMENTO" ||
            glbEtapa === "CONFIRMADO CANCELAMENTO") {
          if (!glbInformacoesExtraidas) {
            // Usar a OpenAI para extrair os detalhes
            glbInformacoesExtraidas = await agenteExtracaoInfConversa();
          }
          await processarAgendamCancelam();
        }
      }
    } else {
      let respostaIA = "";
      if (image) {
        respostaIA = "Desculpe, atualmente não consigo processar imagem, " +
        "apenas mensagens de texto. Você consegue enviar por escrito? " +
        "Ficarei feliz em ajudar!  😊";
        //
      } else if (video) {
        respostaIA = "Desculpe, atualmente não consigo processar video, " +
        "apenas mensagens de texto. Você consegue enviar por escrito? " +
        "Ficarei feliz em ajudar!  😊";
        //
      } else if (audio) {
        respostaIA = "Desculpe, atualmente não consigo processar audio, " +
        "apenas mensagens de texto. Você consegue enviar por escrito? " +
        "Ficarei feliz em ajudar!  😊";
        //
      } else if (document) {
        respostaIA = "Desculpe, atualmente não consigo processar " +
        "documento, apenas mensagens de texto. Você consegue enviar " +
        "por escrito? Ficarei feliz em ajudar!  😊";
        //
      }
      drmEnviarMensagemWhatsApp(respostaIA);

      // Adicionar a resposta do assistente ao histórico
      glbHistoricoDaConversa.push({role: "assistant", content: respostaIA});
      // Salvar o histórico atualizado
      salvarHistoricoDaConversa();
    }
    // else {
    //   // const respostaIA = "Desculpe, atualmente só consigo processar " +
    //   //   "mensagens de texto. Você consegue enviar por escrito? " +
    //   //   "Ficarei feliz em ajudar!  😊";

    //   const respostaIA = "...";
    //   drmEnviarMensagemWhatsApp(respostaIA);
    // }
  }
  dbRef.ref().update(updates)
      .then(() => console.log("Logs atualizados com sucesso!"))
      .catch((error) => console.error("Erro ao atualizar logs:", error));

  res.status(200).send("glbHistoricoDaConversa: \n\n" +
    JSON.stringify(glbHistoricoDaConversa));
});
// Exportar como função Firebase
exports.drmAtendimentoWAKatia = functions
    .runWith({timeoutSeconds: 540, memory: "512MB"})
    .https.onRequest(app);

/** **************************************************************
 * chamarDrmAtendWAKatia
 * @async
 * @constructor
 * @param {string} mensagem - texto a ser enviado
 * @param {string} messageId - simula messageId WA
 * @return {Promise<Object>} - Retorna o histórico de conversas
 ** *************************************************************/
async function chamarDrmAtendWAKatia(mensagem, messageId) {
  console.log("*********** Entrou chamarDrmAtendWAKatia: " + mensagem,
      glbPhone);

  const urlZapi = "http://127.0.0.1:5001/teste-b720c/us-central1/drmAtendimentoWAKatia/webhook";

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", urlZapi, true);
    request.setRequestHeader("Content-Type", "application/json");

    const postData = JSON.stringify({
      "phone": "5521971938840",
      "messageId": messageId,
      "text": {
        "message": mensagem,
      },
    });

    request.onload = () => {
      if (request.status === 200) {
        resolve(request.responseText); // Retorna o texto da resposta
      } else {
        console.error("Erro em chamarDrmAtendWAKatia. Status: " +
          request.status + ", Mensagem: " + request.responseText);
        // Rejeita com o erro
        reject(new Error("Erro: " + request.responseText));
      }
    };

    request.onerror = () => {
      reject(new Error("Erro de conexão ao fazer a requisição."));
    };

    request.send(postData);
  });
}

const fs = require("fs");
const path = require("path");

// Programa de testes para drmAtendimentoWAKatia
exports.drmTestAtendWAKatia = functions
    .runWith({timeoutSeconds: 540, memory: "512MB"})
    .https.onRequest(async (req, res) => {
      console.log("Entrou em drmTestAtendWAKatia");

      const dbRef = admin.database();

      // Caminho para o arquivo JSON local
      const filePath = path.
          join("C:", "Users", "Master",
              "OneDrive", "Área de Trabalho", "DRM.json");

      try {
        // Leitura do arquivo JSON
        const fileContent = fs.readFileSync(filePath, "utf8");
        const jsonData = JSON.parse(fileContent);

        // Definir o conteúdo do JSON no nó "/DRM/"
        await dbRef.ref("/DRM/").set(jsonData);
      } catch (fileError) {
        console.error("Erro ao carregar o arquivo JSON:", fileError);
        res.status(500).send("Erro ao carregar o arquivo JSON.");
        return;
      }

      await dbRef.ref("/DRM/agendamentoWhatsApp/operacional/").set(false);
      await admin.firestore().collection("historicoDaConversa")
          .doc("5521971938840").delete();

      try {
        let historico = {};

        // *****************************************************************
        // Agendamento Roteiro de Testes
        // *****************************************************************
        // historico = await chamarDrmAtendWAKatia("Oi", "messageId00");
        // historico = await chamarDrmAtendWAKatia("Queria agendar uma " +
        //   "consulta para mim e para minha mãe", "messageId01");
        // historico = await chamarDrmAtendWAKatia("Nós dois temos petrobras",
        //     "messageId02");
        // historico = await chamarDrmAtendWAKatia("Ela está reclamando que " +
        //   "está vendo moscas volantes " +
        //   "e eu estou com a visao meio embaçada", "messageId03");
        // historico = await chamarDrmAtendWAKatia("Queremos apenas consulta",
        //     "messageId04");
        // historico = await chamarDrmAtendWAKatia("Quero marcar dia 20 " +
        //   "para as 16:00 e 17:00 na tijuca ", "messageId05");
        // historico = await chamarDrmAtendWAKatia("Helena Maria ; " +
        //   "21-01-1964; 918.881.667-20; 123456789", "messageId06");
        // historico = await chamarDrmAtendWAKatia("Gabriel Ferreira ; " +
        //     "25/01/1996; 164.386.197-28; 987456321", "messageId07");
        // historico = await chamarDrmAtendWAKatia("Sim", "messageId08");
        // historico = await chamarDrmAtendWAKatia("Obrigado", "messageId09");
        // historico = await chamarDrmAtendWAKatia("Esqueci de agendar para " +
        //   "mais uma pessoa, para um amigo", "messageId010");
        // historico = await chamarDrmAtendWAKatia("vai ser no particular",
        //     "messageId11");
        // historico = await chamarDrmAtendWAKatia("Glaucoma",
        //     "messageId12");
        // historico = await chamarDrmAtendWAKatia("Ele tem exames de " +
        //   "Campimetria, Curva Tensional e Capsulotomia", "messageId13-01");
        // historico = await chamarDrmAtendWAKatia("sim",
        //     "messageId13-02");
        // historico = await chamarDrmAtendWAKatia("Teria para março ?",
        //     "messageId14-01");
        // historico = await chamarDrmAtendWAKatia("11/3 as 14",
        //     "messageId14-02");
        // historico = await chamarDrmAtendWAKatia("Eu não sei os dados dele" +
        //   ", sei apenas que ele se chama Alexandre", "messageId15");
        // historico = await chamarDrmAtendWAKatia("pode prossseguir",
        //     "messageId16");
        // historico = await chamarDrmAtendWAKatia("obrigado", "messageId17");

        // *****************************************************************
        // Agendamento Roteiro de Testes - CANCELAMENTO
        // *****************************************************************
        // historico = await chamarDrmAtendWAKatia("Oi. Vcs aceitam Bradesco?",
        //     "messageId00");
        // historico = await chamarDrmAtendWAKatia("Queria agendar uma " +
        //   "consulta para minha esposa e para mim", "messageId01");
        // historico = await chamarDrmAtendWAKatia("eu e ela temos bradesco",
        //     "messageId02");
        // historico = await chamarDrmAtendWAKatia("vamos conferir o grau " +
        //   " dos oculos", "messageId03");
        // historico = await chamarDrmAtendWAKatia("não temos exames",
        //     "messageId04");
        // historico = await chamarDrmAtendWAKatia("Queremos marcar dia 27 " +
        //   "para as 14:00 e 15:00 na ciom ", "messageId05");
        // historico = await chamarDrmAtendWAKatia("Luciana Sousa ; " +
        //   "24-03-2015; 918.881.667-20; 123456789", "messageId06");
        // historico = await chamarDrmAtendWAKatia(" gabriel Ferreira da silva"
        //     "25-01-1964; 164.386.197-28; 123456789", "messageId06-02");
        // historico = await chamarDrmAtendWAKatia("Sim", "messageId07");
        // historico = await chamarDrmAtendWAKatia("Obrigado", "messageId08");


        // historico = await chamarDrmAtendWAKatia("Oi", "messageId18");
        // historico = await chamarDrmAtendWAKatia("Queria cancelar uma " +
        //   "consulta", "messageId19");
        // historico = await chamarDrmAtendWAKatia("Queria cancelar a " +
        // "a consulta da Luciana ", "messageId20");
        // historico = await chamarDrmAtendWAKatia("sim", "messageId21");
        // historico = await chamarDrmAtendWAKatia("obrigado",
        //     "messageId22");

        // historico = await chamarDrmAtendWAKatia("queria cancelar uma " +
        //   "consulta", "messageId22-01");

        // historico = await chamarDrmAtendWAKatia("Oi", "messageId23");
        // historico = await chamarDrmAtendWAKatia("Queria agendar uma " +
        //   "consulta para minha esposa", "messageId24");
        // historico = await chamarDrmAtendWAKatia("ela tem bradesco",
        //     "messageId25");
        // historico = await chamarDrmAtendWAKatia("conferir o grau do oculos",
        //     "messageId26");
        // historico = await chamarDrmAtendWAKatia("Quer apenas consulta",
        //     "messageId27");


        // *****************************************************************
        // *****************************************************************
        // // *****************************************************************
        // // Agendamento 1 - Alexandre
        // // *****************************************************************
        // historico = await chamarDrmAtendWAKatia("Oi", "messageId00");
        // historico = await chamarDrmAtendWAKatia(
        //     "Queria agendar uma consulta", "messageId01");
        // historico = await chamarDrmAtendWAKatia("Petrobrás", "messageId02");
        // historico = await chamarDrmAtendWAKatia("Glaucoma", "messageId03");
        // historico = await chamarDrmAtendWAKatia("Biometria Ultrassonica, " +
        //   "Campimetria e Capsulotomia", "messageId03-01");
        // historico = await chamarDrmAtendWAKatia("apenas consulta, " +
        //     "", "messageId03-01");
        // historico = await chamarDrmAtendWAKatia("Tijuca", "messageId04");
        // historico = await chamarDrmAtendWAKatia("As 15h", "messageId05");
        // historico = await chamarDrmAtendWAKatia("Alexandre Lobo; " +
        //   "22-03-2015; 038.099.957-97; 5145642577", "messageId06");
        // historico = await chamarDrmAtendWAKatia("Sim", "messageId07");
        // historico = await chamarDrmAtendWAKatia("Obrigado", "messageId08");

        // // ****************************************************************
        // // Agendamento para 3 pessoas
        // // ****************************************************************
        historico = await chamarDrmAtendWAKatia(
            "Olá. Gostaria de agendar uma consulta pra mim, minha esposa e " +
            "meu filho.", "messageId51");
        historico = await chamarDrmAtendWAKatia("particular", "messageId52");
        historico = await chamarDrmAtendWAKatia("revisao de grau",
            "messageId53");
        historico = await chamarDrmAtendWAKatia("sem exames", "messageId54");
        historico = await chamarDrmAtendWAKatia("sim", "messageId55");
        historico = await chamarDrmAtendWAKatia(
            "dia 20 na tijuca", "messageId56");
        // historico = await chamarDrmAtendWAKatia(
        //     "8:00, 8:30 e 9:00", "messageId57");
        historico = await chamarDrmAtendWAKatia(
            "agende para cada um os horários de " +
            "8:00 para mim, 8:30 para katia e 9:00 " +
            "para o Arthur", "messageId57");
        historico = await chamarDrmAtendWAKatia("Katia Melo; " +
           "10-04-1978; 257.038.308-26; 2456756835676 \nAlexandre Lobo; " +
           "22-03-1974; 038.099.957-97; 5145642577\nArthur Melo; " +
           "07-12-2007; 038.038.038-97; 1231642577", "messageId58");
        historico = await chamarDrmAtendWAKatia("Sim", "messageId59");
        historico = await chamarDrmAtendWAKatia("Obrigado", "messageId60");

        // // ****************************************************************
        // // Agendamento 1 de novo
        // // ****************************************************************
        // // historico = await chamarDrmAtendWAKatia("Oi", "messageId40");
        // historico = await chamarDrmAtendWAKatia(
        //     "Queria agendar outra consulta", "messageId41");
        // historico = await chamarDrmAtendWAKatia("Petrobras", "messageId42");
        // historico = await chamarDrmAtendWAKatia("Glaucoma", "messageId43");
        // historico = await chamarDrmAtendWAKatia("Biometria Ultrassonica, " +
        //   "Campo Visual e Capsulotomia", "messageId43-01");
        // historico = await chamarDrmAtendWAKatia("14h", "messageId44");

        // // ****************************************************************
        // // Agendamento 2
        // // ****************************************************************
        // historico = await chamarDrmAtendWAKatia(
        //     "Gostaria de agendar pra minha esposa tb", "messageId11");
        // historico = await chamarDrmAtendWAKatia("Unimed", "messageId12");
        // historico = await chamarDrmAtendWAKatia("Retina", "messageId13");
        // historico = await chamarDrmAtendWAKatia("10h", "messageId14");
        // historico = await chamarDrmAtendWAKatia("Katia Melo; " +
        //   "10-04-1974; 257.038.308-26; 2456756835676", "messageId15");
        // historico = await chamarDrmAtendWAKatia("Sim", "messageId16");
        // historico = await chamarDrmAtendWAKatia("Obrigado", "messageId17");

        // // ****************************************************************
        // // Cancelamento
        // // ****************************************************************
        // historico = await chamarDrmAtendWAKatia(
        //     "cancelar uma das consultas", "messageId21");
        // historico = await chamarDrmAtendWAKatia(
        //     "Pode cancelar a da Katia", "messageId22");
        // historico = await chamarDrmAtendWAKatia("Sim", "messageId23");

        // // ****************************************************************
        // // Agendamento em dia não disponível
        // // ****************************************************************
        // historico = await chamarDrmAtendWAKatia(
        //     "Oi. Queria agendar uma consulta pra amanha", "messageId31");
        // historico = await chamarDrmAtendWAKatia("Petrobras", "messageId32");
        // historico = await chamarDrmAtendWAKatia("Glaucoma", "messageId33");
        // historico = await chamarDrmAtendWAKatia("Tem no dia 8?",
        //     "messageId34");

        // *****************************************************************
        // Agendamento em outro dia escolhido pelo usuário
        // *****************************************************************

        // historico = await chamarDrmAtendWAKatia("Oi", "messageId00");
        // historico = await chamarDrmAtendWAKatia(
        //     "Queria agendar uma consulta", "messageId01");
        // historico = await chamarDrmAtendWAKatia("Petrobras", "messageId02");
        // historico = await chamarDrmAtendWAKatia("Glaucoma", "messageId03");
        // historico = await chamarDrmAtendWAKatia("não, " +
        //   "apenas consulta", "messageId03-01");
        // historico = await chamarDrmAtendWAKatia("teria para o dia 27?",
        //     "messageId04");
        // historico = await chamarDrmAtendWAKatia("teria para o dia 29?",
        //     "messageId04");
        // historico = await chamarDrmAtendWAKatia("teria para o dia 30?",
        // "messageId04");
        // historico = await chamarDrmAtendWAKatia("teria para o dia 31?",
        //     "messageId04");
        // historico = await chamarDrmAtendWAKatia("para o final do mês?",
        //     "messageId04");
        // historico = await chamarDrmAtendWAKatia("para a proxima semana?",
        //     "messageId04");
        // historico = await chamarDrmAtendWAKatia("para a semana do dia 20?",
        //     "messageId04");
        // historico = await chamarDrmAtendWAKatia("as 19hs",
        //     "messageId07");
        // historico = await chamarDrmAtendWAKatia("Alexandre Lobo; " +
        //   "22-03-1974; 038.099.957-97; 5145642577", "messageId08");
        // historico = await chamarDrmAtendWAKatia("Sim", "messageId09");
        // historico = await chamarDrmAtendWAKatia("Obrigado", "messageId010");

        // *****************************************************************
        // Agendamento em dias de feriados
        // *****************************************************************
        // historico = await chamarDrmAtendWAKatia("Oi", "messageId00");
        // historico = await chamarDrmAtendWAKatia(
        //     "Queria agendar uma consulta", "messageId01");
        // historico = await chamarDrmAtendWAKatia("Bradesco", "messageId02");
        // historico = await chamarDrmAtendWAKatia(
        //     "Catarata", "messageId03");
        // historico = await chamarDrmAtendWAKatia("não, " +
        //   "apenas consulta", "messageId03-01");
        // historico = await chamarDrmAtendWAKatia("tem para março?",
        //     "messageId04");
        // historico = await chamarDrmAtendWAKatia("marque pf para dia" +
        //   " 6 as 8:00 na Ciom", "messageId05");

        // historico = await chamarDrmAtendWAKatia("Alexandre Lobo; " +
        //   "22-03-1974; 038.099.957-97; 5145642577", "messageId06");
        // historico = await chamarDrmAtendWAKatia("Sim", "messageId07");
        // historico = await chamarDrmAtendWAKatia("Obrigado", "messageId08");

        // *****************************************************************
        // Agendamento particular com consulta de preços e pediatria
        // *****************************************************************
        // historico = await chamarDrmAtendWAKatia("Oi", "messageId00");
        // historico = await chamarDrmAtendWAKatia(
        //     "Queria agendar uma consulta", "messageId01");
        // historico = await chamarDrmAtendWAKatia("consulta particular",
        //     "messageId02");
        // historico = await chamarDrmAtendWAKatia("Catarata", "messageId03");
        // historico = await chamarDrmAtendWAKatia("Biometria Ultrassonica, " +
        //       "Campo Visual e Capsulotomia", "messageId04");
        // historico = await chamarDrmAtendWAKatia("qual o preço da consulta?",
        //      "messageId05");
        // historico = await chamarDrmAtendWAKatia("sim quero continuar"
        //     , "messageId05");
        // historico = await chamarDrmAtendWAKatia("marque pf para dia" +
        //   " 23 as 17:00", "messageId06");
        // historico = await chamarDrmAtendWAKatia("Alexandre Lobo; " +
        //   "22-03-2024; 038.099.957-97; 5145642577", "messageId07");
        // historico = await chamarDrmAtendWAKatia("Sim", "messageId08");
        // historico = await chamarDrmAtendWAKatia("Obrigado", "messageId09");

        // *****************************************************************
        // Agendamento com paciente que não quer fornecer dados
        // *****************************************************************
        // historico = await chamarDrmAtendWAKatia("Oi", "messageId00");
        // historico = await chamarDrmAtendWAKatia(
        //     "Queria agendar uma consulta", "messageId01");
        // historico = await chamarDrmAtendWAKatia("plano bradesco",
        //     "messageId02");
        // historico = await chamarDrmAtendWAKatia("Catarata", "messageId03");
        // historico = await chamarDrmAtendWAKatia("Biometria Ultrassonica, " +
        //       "Campo Visual e Capsulotomia", "messageId04");
        // historico = await chamarDrmAtendWAKatia("marque pf para dia" +
        //   " 17 as 16:00 na oftalmoday", "messageId05");
        // historico = await chamarDrmAtendWAKatia("Não quero fornecer " +
        //   "meus dados", "messageId06");
        // historico = await chamarDrmAtendWAKatia("Sim", "messageId07");
        // historico = await chamarDrmAtendWAKatia("Obrigado", "messageId08");

        // *****************************************************************
        // Agendamento particular 1 pessoa
        // *****************************************************************
        // historico = await chamarDrmAtendWAKatia("Oi", "messageId00");
        // historico = await chamarDrmAtendWAKatia(
        //     "Queria agendar uma consulta", "messageId01");
        // historico = await chamarDrmAtendWAKatia("Particular", "messageId02");
        // historico = await chamarDrmAtendWAKatia("Glaucoma", "messageId03");
        // historico = await chamarDrmAtendWAKatia("Biometria Ultrassonica, " +
        //   "Campimetria e Capsulotomia", "messageId03-01");
        // historico = await chamarDrmAtendWAKatia("sim continuar",
        //     "messageId03-02");
        // historico = await chamarDrmAtendWAKatia("Tijuca", "messageId04");
        // historico = await chamarDrmAtendWAKatia("As 15h", "messageId05");
        // historico = await chamarDrmAtendWAKatia("Alexandre Lobo; " +
        //   "22-03-1974; 038.099.957-97; 5145642577", "messageId06");
        // historico = await chamarDrmAtendWAKatia("Sim", "messageId07");
        // historico = await chamarDrmAtendWAKatia("Obrigado", "messageId08");

        // *****************************************************************
        // Agendamento particular 2 pessoa
        // *****************************************************************
        // historico = await chamarDrmAtendWAKatia("Oi", "messageId00");
        // historico = await chamarDrmAtendWAKatia("Queria agendar uma " +
        //   "consulta para mim e para minha mãe", "messageId01");
        // historico = await chamarDrmAtendWAKatia(
        //  "eu Particular ela é bradesco",
        //     "messageId02");
        // historico = await chamarDrmAtendWAKatia("para mim consulta simples" +
        // " e para ela gostaria de uma consulta com um médico especializado " +
        //   "em glaucoma", "messageId03");
        // historico = await chamarDrmAtendWAKatia("eu vou fazer os exames:" +
        //   "Biometria Ultrassonica e ela: Campimetria e Capsulotomia",
        // "messageId03-01");
        // historico = await chamarDrmAtendWAKatia("sim continuar",
        //     "messageId03-02");
        // historico = await chamarDrmAtendWAKatia("Tijuca", "messageId04");
        // historico = await chamarDrmAtendWAKatia("As 15h e 16hs eu e ela",
        //     "messageId05");
        // historico = await chamarDrmAtendWAKatia("Gabriel Ferreira; " +
        //   "25-01-2024; 16438619728; 5145642577", "messageId06");
        // historico = await chamarDrmAtendWAKatia("Helena Maria; " +
        //   "21-01-19645; 91888166720; 5145642577", "messageId06-02");
        // historico = await chamarDrmAtendWAKatia("Sim", "messageId07");
        // historico = await chamarDrmAtendWAKatia("Obrigado", "messageId08");
        // *****************************************************************
        // REAGENDAMENTO unico - Alexandre
        // *****************************************************************
        historico = await chamarDrmAtendWAKatia("Oi", "messageId00");
        historico = await chamarDrmAtendWAKatia(
            "Queria Reagendar uma consulta", "messageId01-001");
        historico = await chamarDrmAtendWAKatia("do Alexandre",
            "messageId002");
        // historico = await chamarDrmAtendWAKatia("tem para outra unidade?, " +
        //   "", "messageId003");
        historico = await chamarDrmAtendWAKatia("coloca no dia 20 " +
          "na na Barra", "messageId004");
        historico = await chamarDrmAtendWAKatia("coloca " +
            "as 11:30", "messageId005");
        historico = await chamarDrmAtendWAKatia("pode, " +
            "", "messageId006");
        historico = await chamarDrmAtendWAKatia("Obrigado", "messageId007");


        console.log(historico);
        res.status(200).send(historico);
      } catch (error) {
        console.error("Erro ao chamarDrmAtendWAKatia:", error);
        res.status(500).send("Erro ao processar a requisição.");
      }
    });


exports.drmPacienteValidadoBtActions = functions.https
    .onRequest(async (req, res) => {
      const {telefone, unidade, data, hora, paciente,
        convenio, telefoneUnidade, diaSemana, acao} = req.query;
      console.log("Entrou drmPacienteValidadoBtActions");

      if (!telefone || !unidade || !data || !hora) {
        return res.status(400).send("Parâmetros faltando");
      }

      const db = admin.database();
      let updatesValidado = {};
      let script = "";
      let script2 = "";
      let whatsAppCel = "";

      // Converte DD/MM/AAAA → AAAA-MM-DD (formato das chaves no RTDB)
      const dateKey = data
          .includes("/") ? data
              .split("/").reverse().join("-") : data;

      const agendadosRef = db
          .ref("DRM/agendamentoWhatsApp/operacional/consultasAgendadas");
      const canceladosRef = db
          .ref("DRM/agendamentoWhatsApp/operacional/consultasCanceladas");

      const telefonePath = `/telefones/${telefone}/${dateKey}/${hora}`;
      const unidadePath = `/unidades/${unidade}/${dateKey}/${hora}`;

      try {
        if (acao === "validar") {
          console.log("Entrou em validar");

          const snapshotTel = await agendadosRef
              .child(telefonePath).once("value");
          const snapshotUni = await agendadosRef
              .child(unidadePath).once("value");

          console.log("snapshotTel: " + JSON.stringify(snapshotTel));
          console.log("snapshotUni: " + JSON.stringify(snapshotUni));
          console.log("agendadosRef: " + JSON.stringify(agendadosRef));
          console.log("canceladosRef: " + JSON.stringify(canceladosRef));
          console.log("telefonePath: " + JSON.stringify(telefonePath));
          console.log("unidadePath: " + JSON.stringify(unidadePath));


          if (snapshotTel.exists() && snapshotUni.exists()) {
            console.log("colocou Validado:true");

            updatesValidado = {
              [`${telefonePath}/validado`]: true,
              [`${unidadePath}/validado`]: true,
            };
            await agendadosRef.update(updatesValidado);
          }

          // return res.status(200).send("✅ Agendamento validado com sucesso.");
          script = `<!-- Ícone de sucesso -->
            <div class="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg"
                  class="h-16 w-16 text-green-500"
                  fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M9 12l2 2 4-4M12 22C6.477 
                            22 2 17.523 2 12S6.477 2 12 2s10 4.477
                            10 10-4.477 10-10 10z"/>
              </svg>
            </div>`;
          script2 = `Agendamento Validado!`;


          // enviar mensagem Zapi

          let parametros = {};
          whatsAppCel = telefoneUnidade;

          if (ambiente == "teste") {
            // whatsAppCel = "5521997975125"; // tel vermelho
            // whatsAppCel = "5521984934862"; // Alexandre
            // whatsAppCel = "5521971938840"; // Gabriel

            parametros = {
              id: "3B74CE9AFF0D20904A9E9E548CC778EF",
              token: "A8F754F1402CAE3625D5D578",

            };
          } else {
            parametros = {
              id: "3D460A6CB6DA10A09FAD12D00F179132",
              token: "1D2897F0A38EEEC81D2F66EE",

            };
          }
          const message = "✅ *Paciente Validado*" +
          "\n*Nome:* " + paciente +
          "\n*Data/Hora:* " + diaSemana + " " + data + " às " + hora +
          "\n*Convenio:* " + convenio;

          const arrMessage = [
            {
              phone: whatsAppCel,
              message: message,
            },
          ];

          const i = 0;
          callZapiV3(arrMessage, parametros, i);
        }
        //
        if (acao === "cancelar") {
          // 1. Recupera os dados do paciente
          const snapshotTel = await agendadosRef
              .child(telefonePath).once("value");
          const snapshotUni = await agendadosRef
              .child(unidadePath).once("value");
          const dadosPaciente = snapshotTel.val();

          if (snapshotTel.exists() || snapshotUni.exists()) {
            dadosPaciente.motivoCancelamento = "Cancelado pela secretária";


            // 2. Salva no nó de cancelados
            await canceladosRef
                .child(`telefones/${telefone}/${dateKey}/${hora}`)
                .set(dadosPaciente);
            await canceladosRef
                .child(`unidades/${unidade}/${dateKey}/${hora}`)
                .set(dadosPaciente);

            // 3. Remove do nó de agendados
            await agendadosRef.child(telefonePath).remove();
            await agendadosRef.child(unidadePath).remove();
          }

          script = `<!-- Ícone de cancelamento -->
          <div class="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 text-red-600"
                fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>`;
          script2 = `Agendamento Cancelado!`;
        }
        return res.status(200).send(`<!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, 
          initial-scale=1.0"/>
          <title>Validação Concluída</title>
          <!-- CDN oficial do Tailwind -->
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-white flex items-start 
        justify-center min-h-screen pt-16 p-4">
          <div class="max-w-md w-full">
            <!-- Cabeçalho em texto, fonte maior -->
            <div class="flex flex-col items-center mb-6">
              <h1 class="text-5xl font-extrabold text-blue-800 
              leading-tight">Dr.Melo</h1>
              <p class="text-xl text-blue-600 mt-1">
              Seu Oftalmologista perto de você</p>
            </div>

            <!-- Caixa de confirmação com borda azul escuro -->
            <div class="bg-white border-4 border-blue-800 
            rounded-xl shadow-lg p-6 text-center -mt-4">
              <!-- Ícone de sucesso ou cancelamento -->
              ${script}
              <!-- Título da confirmação ou do cancelamento-->
              <h2 class="text-2xl font-semibold text-blue-800 mb-2">
                ${script2}
              </h2>
              <!-- Mensagem detalhada -->
              <p class="text-gray-700">
                <strong>Paciente:</strong> ${paciente} <br>
                <strong>Convenio:</strong> ${convenio} <br>
                <strong>Data:</strong> ${data} <br>
                <strong>Hora:</strong> ${hora} <br>
                <strong>Unidade:</strong> ${unidade} <br>
              </p>
            </div>
          </div>
        </body>
        </html>`);
      } catch (err) {
        console.error("Erro ao validar ou cancelar:", err);
        return res.status(500).send("Erro interno");
      }
    });


exports.drmAtendimentoWAKatiaZapi =
    functions.database.ref("DRM/agendamentoWhatsApp/operacional/" +
      "consultasAgendadas/unidades/{unidade}/" +
      "{dataAgendamento}/{horaAgendamento}")
        .onWrite(async (change, context) => {
          const dbRef = admin.database();

          console.log("Entrou drmAtendimentoWAKatiaZapi");

          // Converte "DD/MM/AAAA" → Date
          const parseDate = (str) => {
            const [d, m, y] = str.split("/");
            return new Date(y, m - 1, d);
          };

          // Calcula idade em anos completos
          const calcularIdade = (nascimentoStr) => {
            if (!nascimentoStr) return "";
            const nasc = parseDate(nascimentoStr);
            const hoje = new Date();
            let idade = hoje.getFullYear() - nasc.getFullYear();
            const m = hoje.getMonth() - nasc.getMonth();
            if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
              idade--;
            }
            return idade;
          };

          // Retorna o dia da semana em PT-BR
          const diaSemanaDe = (dataStr) => {
            if (!dataStr) return "";
            const dias = [
              "Dom",
              "Seg",
              "Ter",
              "Qua",
              "Qui",
              "Sex",
              "Sab",
            ];
            return dias[parseDate(dataStr).getDay()];
          };


          let element = {};
          let message1 = "";
          let complemento = "";
          // let ambienteLink = "";

          let acao = null;
          if (!change.after.exists() && change.before.exists()) {
            acao = "cancelar";
            element = change.before.val();
            message1 = "📢 *Houve um CANCELAMENTO - Dr. Melo* ";
          } else {
            acao = "agendar";
            // Verifica se a única mudança foi no campo "valid
            const beforeVal = change.before.val();
            const afterVal = change.after.val();

            // Se só o campo "validado" mudou, não envia mensagem de novo
            if ((beforeVal !== null) &&
                (afterVal !== null) &&
                (((beforeVal["validado"] === undefined) &&
                (afterVal["validado"] !== undefined)) ||
                ((beforeVal["confirmado"] === undefined) &&
                (afterVal["confirmado"] !== undefined)))) {
              console.log("Mudança apenas no campo " +
                  "'validado' ou 'Confirmado'" +
                          ". Ignorando...");
              return null;
            }

            element = afterVal;
            message1 = "📢 *Novo AGENDAMENTO - Dr. Melo* ";
            // complemento = "\n\n*IMPORTANTE:* Entre em contato com o " +
            //   "paciente para obter demais dados e validar se o subplano " +
            //   "é aceito pela clinica. \n\nApós o contato, se estiver " +
            //   "tudo certo, clique em Validar Agendamento. \n\nCaso " +
            //   "contrario clique em Cancelar Agendamento.";

            complemento = "\n\n*IMPORTANTE:* Entre em contato com o " +
              "paciente para obter demais dados e validar se o subplano " +
              "é aceito pela clinica.";
          }

          let unidade = "";
          if (element.unidade) {
            unidade = element.unidade;
          }
          // Busca as configurações para obter o telefone da unidade
          const configuracoesSnapshot = await dbRef.
              ref("DRM/agendamentoWhatsApp/configuracoes/unidades/" +
              unidade ).once("value");
          const configuracoes = configuracoesSnapshot.val();
          const telefoneUnidade = configuracoes.whatsApp;

          console.log("element:" + JSON.stringify(JSON.stringify(element)));
          console.log("telefone unidade:" + JSON.stringify(telefoneUnidade));

          let paciente = "";
          if (element.nomePaciente) {
            paciente = element.nomePaciente;
          }
          let nascimento = "";
          if (element.nascimento) {
            nascimento = element.nascimento;
          }
          let data = "";
          if (element.dataAgendamento) {
            data = element.dataAgendamento;
          }
          let horario = "";
          if (element.horaAgendamento) {
            horario = element.horaAgendamento.replace("-", ":");
          }
          let convenio = "";
          if (element.convenio) {
            convenio = element.convenio;
          }
          let motivacao = "";
          if (element.motivacao) {
            motivacao = element.motivacao;
          }
          let exames = "";
          if (element.exames) {
            exames = element.exames;
          }
          let telPaciente;
          if (element.telefone) {
            telPaciente = element.telefone;
          }
          let whatsAppCel;
          if (telefoneUnidade) {
            whatsAppCel = JSON.stringify(telefoneUnidade);
          }
          let obs;
          if (element.exames) {
            obs = element.obs;
          }
          let cpf;
          let complementoCpf = "";
          if (element.cpf) {
            cpf = element.cpf;
            complementoCpf = "\n*CPF:* " + cpf;
          }

          let cancelData = "";
          let agendData = "";
          let enviarMsgSecretaria = true;
          let motivoCancelamento;


          // motivo cancelamento ------------
          if (acao === "cancelar") {
            console.log("entrou em acao === 'cancelar'");

            const datamodificada = data.split("/")[2] + "-" +
            data.split("/")[1] + "-" + data.split("/")[0];

            const cancelSnap = await dbRef.
                ref("DRM/agendamentoWhatsApp/operacional/" +
                  "consultasCanceladas/unidades/" + unidade + "/" +
                  datamodificada + "/" + horario).once("value");

            console.log("cancelSnap:", JSON.stringify(cancelSnap.val()));
            console.log("unidade:", unidade);
            console.log("datamodificada:", datamodificada);
            console.log("horario:", horario);

            cancelData = cancelSnap.val() || {};

            motivoCancelamento = cancelData.motivoCancelamento;
            enviarMsgSecretaria = cancelData.enviarMsgSecretaria;

            console.log("motivoCancelamento: " + motivoCancelamento);
            console.log("enviarMsgSecretaria: " + enviarMsgSecretaria);
          }


          // enviar mensagem para secretaria em agendamento
          if (acao === "agendar") {
            const datamodificada = data.split("/")[2] + "-" +
                data.split("/")[1] + "-" + data.split("/")[0];

            const agendSnap = await dbRef.
                ref("DRM/agendamentoWhatsApp/operacional/" +
                  "consultasAgendadas/unidades/" + unidade + "/" +
                  datamodificada + "/" + horario).once("value");

            agendData = agendSnap.val() || {};

            enviarMsgSecretaria = agendData.enviarMsgSecretaria;
            console.log("enviarMsgSecretaria: " + enviarMsgSecretaria);
          }

          if (enviarMsgSecretaria === undefined ||
                enviarMsgSecretaria === null ||
                enviarMsgSecretaria === "") {
            enviarMsgSecretaria = true;
          }


          let auxComplementoValor = "";
          if (convenio === "Particular") {
            //
            // Calcula o somatório dos valores a pagar pelo paciente
            const examesSnapshot = await admin.database()
                .ref("DRM/agendamentoWhatsApp/configuracoes/exames")
                .once("value");
            const tabelaExames = examesSnapshot.val() || {};

            let valorAPagarPaciente = 0;
            if (Array.isArray(element.exames)) {
              element.exames.forEach((nomeExame) => {
                const conf = tabelaExames[nomeExame];
                if (conf) {
                  const preco = Number(conf.preco) || 0;
                  valorAPagarPaciente += preco;
                }
              });
            }
            console.log("valorAPagarPaciente: " + valorAPagarPaciente);

            auxComplementoValor = "\n*Valor:* R$ " +
              valorAPagarPaciente + ",00";
          }

          const idade = calcularIdade(nascimento);
          const diaSemana = diaSemanaDe(data);

          if (whatsAppCel) {
            let parametros = {};

            // whatsAppCel = telefone da unidade
            if (ambiente == "teste") {
              // whatsAppCel = "5521997975125"; // tel vermelho
              // whatsAppCel = "5521984934862"; // Alexandre
              whatsAppCel = "5521971938840"; // Gabriel;
              whatsAppCel = "5521972555867"; // Tel Teste;
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                token: "A8F754F1402CAE3625D5D578",

              };
            } else {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "3D460A6CB6DA10A09FAD12D00F179132",
                token: "1D2897F0A38EEEC81D2F66EE",

              };
            }
            console.log("whatsAppCel (Tel Unidade):", whatsAppCel);

            // if (ambiente === "teste") {
            //   ambienteLink = "teste-b720c";
            // } else {
            //   ambienteLink = "oftautomacao-9b427";
            // }

            // === Gera o link de validação (fixo)

            // const auxLink =
            //   "https://us-central1-" + ambienteLink +".cloudfunctions.net/" +
            //   "drmPacienteValidadoBtActions" +
            //   `?telefone=${encodeURIComponent(telPaciente)}` +
            //   `&unidade=${encodeURIComponent(unidade)}` +
            //   `&data=${encodeURIComponent(data)}` +
            //   `&hora=${encodeURIComponent(horario)}` +
            //   `&paciente=${encodeURIComponent(paciente)}` +
            //   `&convenio=${encodeURIComponent(convenio)}` +
            //   `&telefoneUnidade=${encodeURIComponent(telefoneUnidade)}` +
            //   `&diaSemana=${encodeURIComponent(diaSemana)}`;


            // const validationLink = auxLink + "&acao=validar";
            // const cancelLink = auxLink + "&acao=cancelar";

            message1 = message1 +
            "\nSegue abaixo os detalhes:" +
            "\n" +
            "\n*Data:* " + diaSemana + " " + data + " " + horario +
            "\n*Paciente :* " + paciente + " (" + idade + " anos)" +
            auxComplementoValor +
            "\n*Convênio:* " + convenio +
            "\n*Exames:* " + exames +
            "\n*Motivacao:* " + motivacao +
            "\n*Local:* " + unidade +
            "\n*Telefone do Paciente:* " + telPaciente +
            "\n*Nascimento:* " + nascimento +
            complementoCpf +
            "\n*Observações:* " + obs +
            complemento;

            let arrMessage = [];
            let messagePaciente = "";
            if ((message1.includes("CANCELAMENTO")) &&
              (motivoCancelamento === "Não compareceu à consulta")) {
              console.log("Entrou no pacientes faltosos DRM");
              messagePaciente = "Olá! Aqui é do Dr. Melo. 😊" +
                "\n\nNa data " + data + " às " + horario +
                ", o(a) paciente " + paciente +
                " tinha uma consulta agendada na unidade " + unidade + "." +
                "\n\nVimos que não pôde comparecer. " +
                "\n\nGostaria de agendar uma nova consulta?";

              // se message = "", mensagem não é enviada
              message1 = "";
            }
            if (enviarMsgSecretaria === false) {
              console.log("Não enviar mensagem para a secretária");
              message1 = "";
            }


            // para saber se há uma informação especifica dentro da variável
            // if ((complemento.includes("IMPORTANTE")) &&
            //   (whatsAppCel !== "5521994586099")) {
            //   console.log("whatsAppCel: " + whatsAppCel);
            //   arrMessage = [
            //     {
            //       phone: whatsAppCel,
            //       message: message1,
            //       buttonActions: [
            //         {
            //           type: "URL",
            //           url: validationLink,
            //           label: "Validar Agendamento",
            //         },
            //         {
            //           type: "URL",
            //           url: cancelLink,
            //           label: "Cancelar Agendamento",
            //         },
            //       ],
            //     },
            //   ];
            // } else {
            //   console.log("NAO Entrou no botões de ação");
            //   console.log("whatsAppCel: " + whatsAppCel);
            //   arrMessage = [
            //     {
            //       phone: whatsAppCel,
            //       message: message1,
            //     },
            //   ];
            // }
            console.log("telPaciente: " + telPaciente);
            console.log("telefoneUnidade: " + whatsAppCel);

            arrMessage = [
              {
                phone: whatsAppCel,
                message: message1,
              },
              {
                phone: telPaciente,
                message: messagePaciente,
              },
            ];

            const i = 0;
            console.log("arrMessage:", arrMessage);
            callZapiV3(arrMessage, parametros, i);
          }

          return null;
        });

exports.oft45AtendenteVirtualWA01Zapi =
    functions.database.ref("OFT/45/agendamentoWhatsApp/operacional/" +
      "consultasAgendadas/medicos/{medicos}/{dataAgendada}/{horaAgendada}")
        .onWrite(async (change, context) => {
          const dbRef = admin.database();

          console.log("Entrou oft45AtendenteVirtualWA01Zapi");

          // Converte "DD/MM/AAAA" → Date
          const parseDate = (str) => {
            const [d, m, y] = str.split("/");
            return new Date(y, m - 1, d);
          };

          // Calcula idade em anos completos
          const calcularIdade = (nascimentoStr) => {
            if (!nascimentoStr) return "";
            const nasc = parseDate(nascimentoStr);
            const hoje = new Date();
            let idade = hoje.getFullYear() - nasc.getFullYear();
            const m = hoje.getMonth() - nasc.getMonth();
            if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
              idade--;
            }
            return idade;
          };

          // Retorna o dia da semana em PT-BR
          const diaSemanaDe = (dataStr) => {
            if (!dataStr) return "";
            const dias = [
              "Dom",
              "Seg",
              "Ter",
              "Qua",
              "Qui",
              "Sex",
              "Sab",
            ];
            return dias[parseDate(dataStr).getDay()];
          };


          let element = {};
          let message1 = "";
          // let complemento = "";
          // let ambienteLink = "";

          if (!change.after.exists() && change.before.exists()) {
            element = change.before.val();
            message1 = "📢 *Houve um CANCELAMENTO - Atendente Virtual 45* ";
          } else {
            // Verifica se a única mudança foi no campo "valid
            const beforeVal = change.before.val();
            const afterVal = change.after.val();

            // Se só o campo "validado" mudou, não envia mensagem de novo
            if ((beforeVal !== null) &&
                (afterVal !== null) &&
                (((beforeVal["validado"] === undefined) &&
                (afterVal["validado"] !== undefined)) ||
                ((beforeVal["confirmado"] === undefined) &&
                (afterVal["confirmado"] !== undefined)))) {
              console.log("Mudança apenas no campo " +
                  "'validado' ou 'Confirmado'" +
                          ". Ignorando...");
              return null;
            }

            element = afterVal;
            message1 = "📢 *Novo AGENDAMENTO - Atendente Virtual 45* ";
            // complemento = "\n\n*IMPORTANTE:* Entre em contato com o " +
            //   "paciente para obter demais dados e validar se o subplano " +
            //   "é aceito pela clinica. \n\nApós o contato, se estiver " +
            //   "tudo certo, clique em Validar Agendamento. \n\nCaso " +
            //   "contrario clique em Cancelar Agendamento.";
          }

          let medico = "";
          if (element.medico) {
            medico = element.medico;
          }
          let unidade = "";
          if (element.unidade) {
            unidade = element.unidade;
          }
          console.log("unidade: " + unidade);

          // Busca as configurações para obter o telefone da unidade
          const configuracoesSnapshot = await dbRef.
              ref("OFT/45/agendamentoWhatsApp/configuracoes/unidades/" +
              unidade).once("value");
          const configuracoes = configuracoesSnapshot.val();
          const telefoneUnidade = configuracoes.whatsApp;

          console.log("element:" + JSON.stringify(JSON.stringify(element)));
          console.log("telefone unidade:" + JSON.stringify(telefoneUnidade));

          let paciente = "";
          if (element.nomePaciente) {
            paciente = element.nomePaciente;
          }
          let nascimento = "";
          if (element.nascimento) {
            nascimento = element.nascimento;
          }
          let data = "";
          if (element.dataAgendamento) {
            data = element.dataAgendamento;
          }
          let horario = "";
          if (element.horaAgendamento) {
            horario = element.horaAgendamento.replace("-", ":");
          }
          let convenio = "";
          if (element.convenio) {
            convenio = element.convenio;
          }
          let motivacao = "";
          if (element.motivacao) {
            motivacao = element.motivacao;
          }
          let exames = "";
          if (element.exames) {
            exames = element.exames;
          }
          let telPaciente;
          if (element.telefone) {
            telPaciente = element.telefone;
          }
          let whatsAppCel;
          if (telefoneUnidade) {
            whatsAppCel = JSON.stringify(telefoneUnidade);
          }
          let obs;
          if (element.exames) {
            obs = element.exames;
          }

          let auxComplementoValor = "";
          if (convenio === "Particular") {
            // Calcula o somatório dos valores a pagar pelo paciente
            const examesSnapshot = await admin.database()
                .ref("DRM/agendamentoWhatsApp/configuracoes/exames")
                .once("value");
            const tabelaExames = examesSnapshot.val() || {};

            let valorAPagarPaciente = 0;
            if (Array.isArray(element.exames)) {
              element.exames.forEach((nomeExame) => {
                const conf = tabelaExames[nomeExame];
                if (conf) {
                  const preco = Number(conf.preco) || 0;
                  valorAPagarPaciente += preco;
                }
              });
            }
            console.log("valorAPagarPaciente: " + valorAPagarPaciente);

            auxComplementoValor = "\n*Valor:* R$ " +
              valorAPagarPaciente + ",00";
          }

          const idade = calcularIdade(nascimento);
          const diaSemana = diaSemanaDe(data);

          if (whatsAppCel) {
            let parametros = {};

            // whatsAppCel = telefone da unidade
            if (ambiente == "teste") {
              // whatsAppCel = "5521997975125"; // tel vermelho
              // whatsAppCel = "5521984934862"; // Alexandre
              whatsAppCel = "5521971938840"; // Gabriel;
              parametros = {
                whatsAppCel: whatsAppCel,
                // id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                // token: "A8F754F1402CAE3625D5D578",

                id: "39C7A89881E470CC246252059E828D91",
                token: "B1CA83DE10E84496AECE8028",

              };
            } else {
              parametros = {
                whatsAppCel: whatsAppCel,
                id: "39C7A89881E470CC246252059E828D91",
                token: "B1CA83DE10E84496AECE8028",

              };
            }
            console.log("whatsAppCel (Tel Unidade):", whatsAppCel);

            // if (ambiente === "teste") {
            //   ambienteLink = "teste-b720c";
            // } else {
            //   ambienteLink = "oftautomacao-9b427";
            // }

            // === Gera o link de validação (fixo)

            // const auxLink =
            //   "https://us-central1-" + ambienteLink +".cloudfunctions.net/" +
            //   "drmPacienteValidadoBtActions" +
            //   `?telefone=${encodeURIComponent(telPaciente)}` +
            //   `&unidade=${encodeURIComponent(medico)}` +
            //   `&data=${encodeURIComponent(data)}` +
            //   `&hora=${encodeURIComponent(horario)}` +
            //   `&paciente=${encodeURIComponent(paciente)}` +
            //   `&convenio=${encodeURIComponent(convenio)}` +
            //   `&telefoneUnidade=${encodeURIComponent(telefoneUnidade)}` +
            //   `&diaSemana=${encodeURIComponent(diaSemana)}`;


            // const validationLink = auxLink + "&acao=validar";
            // const cancelLink = auxLink + "&acao=cancelar";

            message1 = message1 +
            "\nSegue abaixo os detalhes:" +
            "\n" +
            "\n*Data:* " + diaSemana + " " + data + " " + horario +
            "\n*Paciente :* " + paciente + " (" + idade + " anos)" +
            auxComplementoValor +
            "\n*Convênio:* " + convenio +
            "\n*Nascimento:* " + nascimento +
            "\n*Exames:* " + exames +
            "\n*Motivacao:* " + motivacao +
            "\n*Medico:* " + medico +
            "\n*Telefone do Paciente:* " + telPaciente +
            "\n*Observações:* " + obs;
            // complemento;

            let arrMessage = [];
            // para saber se há uma informação especifica dentro da variável
            // if ((complemento.includes("IMPORTANTE")) &&
            //   (whatsAppCel !== "5521994586099")) {
            //   console.log("whatsAppCel: " + whatsAppCel);
            //   arrMessage = [
            //     {
            //       phone: whatsAppCel,
            //       message: message1,
            //       buttonActions: [
            //         {
            //           type: "URL",
            //           url: validationLink,
            //           label: "Validar Agendamento",
            //         },
            //         {
            //           type: "URL",
            //           url: cancelLink,
            //           label: "Cancelar Agendamento",
            //         },
            //       ],
            //     },
            //   ];
            // } else {

            console.log("NAO Entrou no botões de ação");
            console.log("whatsAppCel: " + whatsAppCel);
            arrMessage = [
              {
                phone: whatsAppCel,
                message: message1,
              },
            ];

            const i = 0;
            callZapiV3(arrMessage, parametros, i);
          }

          return null;
        });


exports.obterLogsPorTelefone = functions.https
    .onRequest(async (req, res) => {
      console.log("Entrou no obterLogsPorTelefone");
      console.log("req.query:" + JSON.stringify(req.query));

      const db = admin.database();

      try {
        const telefone = req.query.telefone;

        if (!telefone) {
          return res.status(200).json({
            error: "Número de telefone não fornecido."});
        } else {
          console.log("telefone: " + telefone);

          const snapshot = await db
              .ref("DRM/agendamentoWhatsApp/operacional/conversas/" +
              telefone + "/log").once("value");

          console.log("Snapshot recebido:", snapshot.exists());

          if (!snapshot.exists()) {
            return res.status(200).json({
              error: "Nenhum log encontrado para este telefone."});
          } else {
            const logs = snapshot.val();
            // Converte logs de objeto para
            // array de strings no formato "timestamp: mensagem"
            const logsArray = Object.entries(logs).map(
                ([timestamp, mensagem]) =>
                  `${timestamp.replace(/"/g, "")}: ${mensagem}`);

            return res.status(200).json({logsArray});
          }
        }
      } catch (error) {
        return res.status(200).json({error: "Erro ao buscar logs."});
      }
    });


// exports.drmFaturamentoUnidadesJson = functions.https
// .onRequest(async (req, resp) => {
exports.drmFaturamentoUnidadesJson = functions.pubsub
    .schedule("05 7 1 * *")
    .timeZone("America/Sao_Paulo")
    .onRun(async (context) => {
      console.log("Entrou drmFaturamentoUnidadesJson");

      const db = admin.database();

      if (local === "emulador") {
        const filePath = path.join("C:", "Users",
            "Master", "OneDrive", "Área de Trabalho", "DRMteste.json");

        try {
          const fileContent = fs.readFileSync(filePath, "utf8");
          const jsonData = JSON.parse(fileContent);
          await db.ref("/DRM/").set(jsonData);
        } catch (fileError) {
          console.error("Erro ao carregar o arquivo JSON:", fileError);
          // resp.status(200).send("Erro ao carregar o arquivo JSON.");
          return;
        }
      }

      const agendadosSnapshot = await db
          .ref("/DRM/agendamentoWhatsApp/operacional/" +
            "consultasAgendadas/unidades").once("value");

      try {
        const agendados = agendadosSnapshot.val();

        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth();

        const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
        const anoMesAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
        const mesAnteriorStr = String(mesAnterior + 1).padStart(2, "0");
        const anoMesRef = `${anoMesAnterior}${mesAnteriorStr}`;

        const inicioMesAnterior = new Date(anoMesAnterior, mesAnterior, 1);
        const fimMesAnterior = new Date(anoMesAnterior, mesAnterior + 1, 0);

        // Agrupando por unidade
        const dadosPorUnidade = {};

        Object.entries(agendados).forEach(([nomeUnidade, dias]) => {
          Object.entries(dias).forEach(([dataStr, horarios]) => {
            const dataAgendamento = new Date(dataStr);
            if (dataAgendamento >= inicioMesAnterior &&
                dataAgendamento <= fimMesAnterior) {
              Object.entries(horarios).forEach(([horaStr, paciente]) => {
                const dia = String(dataAgendamento.getDate()).padStart(2, "0");
                const hora = horaStr.replace(":", "").padStart(4, "0");
                const chave = `${anoMesRef}${dia}${hora}`;

                if (!dadosPorUnidade[nomeUnidade]) {
                  dadosPorUnidade[nomeUnidade] = {};
                }
                if (!dadosPorUnidade[nomeUnidade][anoMesRef]) {
                  dadosPorUnidade[nomeUnidade][anoMesRef] = {};
                }

                dadosPorUnidade[nomeUnidade][anoMesRef][chave] = paciente;
              });
            }
          });
        });

        // Salvar por unidade usando .set()
        const promises = Object.entries(dadosPorUnidade)
            .map(([unidade, dados]) => {
              return db.ref(
                  "/DRM/agendamentoWhatsApp/operacional/faturamento/" +
                    unidade +"/"+ anoMesRef).set(dados[anoMesRef]);
            });

        await Promise.all(promises);

        // resp.status(200).send(
        //     `Consultas do mês ${anoMesRef} salvas com sucesso.`);
      } catch (error) {
        console.error("Erro ao processar:", error);
        // resp.status(500).send("Erro ao processar os dados.");
      }
      return null;
    });


exports.drmFaturamentoUnidadesZapi =
    functions.database.ref("/DRM/agendamentoWhatsApp/operacional/" +
      "faturamento/{unidade}/{anoMes}")
        .onWrite(async (change, context) => {
          const {unidade} = context.params;

          // console.log("anoMes:", anoMes);
          // console.log("keysagendado:", chave);
          // console.log("unidades:", unidade);

          console.log("Entrou drmFaturamentoUnidadesZapi");

          const db = admin.database();

          const unidadesSnapshot = await db
              .ref("DRM/agendamentoWhatsApp/configuracoes/unidades/")
              .once("value");

          const dadosUnidades = unidadesSnapshot.val();
          // console.log("dadosUnidades:" + JSON.stringify(dadosUnidades));

          let whatsAppCel = dadosUnidades[unidade].whatsApp;
          console.log("dadosUnidades[unidade]:",
              JSON.stringify(dadosUnidades[unidade].whatsApp));

          const pacientesUnidade = [];
          let qtdPacUnidade = 0;
          let valorAPagar = 0;

          try {
            // Busca todos os dados da unidade naquele mês
            const element = change.after.val();
            console.log("Pacientes agendados " + JSON.stringify(element));

            Object.entries(element).forEach(([chave, consulta]) => {
              const nome = consulta.nomePaciente || "(Paciente sem nome)";
              const tel = consulta.telefone || "(Paciente sem nome)";
              const hora = consulta.horaAgendada ||
                consulta.horaAgendamento || "(horário não informado)";
              const data = consulta.dataAgendada ||
                consulta.dataAgendamento || "(data não informada)";
              const convenio = consulta.convenio || "(convênio não informado)";

              let cpf = "";
              if (consulta.cpf) {
                cpf = ", CPF: " + consulta.cpf;
              }
              pacientesUnidade.push("\n* " + nome + cpf + ", " + data +
                  " às " + hora + ", " + convenio + ", " + tel);
              qtdPacUnidade += 1;
            });
            valorAPagar = 30 * qtdPacUnidade;
            console.log("Pacientes encontrados:", pacientesUnidade.length);
            console.log("Valor a pagar: " + valorAPagar + ",00");

            if (whatsAppCel) {
              let parametros = {};

              if (ambiente == "teste") {
                // whatsAppCel = "5521997975125";
                whatsAppCel = "5521971938840";
                parametros = {
                  whatsAppCel: whatsAppCel,
                  id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                  token: "A8F754F1402CAE3625D5D578",

                };
              } else {
                whatsAppCel = "5521984934862";
                parametros = {
                  whatsAppCel: whatsAppCel,
                  id: "3D460A6CB6DA10A09FAD12D00F179132",
                  token: "1D2897F0A38EEEC81D2F66EE",

                };
              }
              console.log("whatsAppCel (Tel Unidade):", whatsAppCel);

              // const message1 = "Prezada unidade *" + unidade + "*," +
              // "\n\nSegue abaixo o demonstrativo dos pacientes " +
              // "agendados na sua unidade através da plataforma *Dr. Melo*." +
              // "\n\n🧾 Pacientes agendados:" + pacientesUnidade + "." +
              // "\n\nForam contabilizados " + qtdPacUnidade +
              // " pacientes agendados para a sua unidade, " +
              // "valor total a ser cobrado: *R$" + valorAPagar + ",00*.";

              const message1 = "Olá, tudo bem?" +
              "\n\nVocê pode verificar quais desses pacientes " +
              "vindos do Dr Melo foram realmente atendidos na " +
              unidade + " ?" +
               "\n\n🧾 Pacientes agendados:" + pacientesUnidade + ".";


              const arrMessage = [{
                "phone": whatsAppCel,
                "message": message1,
              }];

              const i = 0;
              callZapiV3(arrMessage, parametros, i);
            }
          } catch (erro) {
            console.error("❌ Erro ao enviar mensagem de faturamento:", erro);
            return null;
          }

          return null;
        });


// ---- novo projeto

// exports.drmPesquisaSatisfacao = functions.https
//     .onRequest(async (req, resp) => {
exports.drmPesquisaSatisfacao = functions.pubsub
    .schedule("00 13 * * *")
    .timeZone("America/Sao_Paulo")
    .onRun(async (context) => {
      console.log("Entrou drmPesquisaSatisfacao");

      const agora = new Date();
      const partes = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(agora);

      let ano = 0;
      let mes = 0;
      let dia = 0;
      partes.forEach((p) => {
        if (p.type === "year") ano = parseInt(p.value, 10);
        if (p.type === "month") mes = parseInt(p.value, 10);
        if (p.type === "day") dia = parseInt(p.value, 10);
      });
      const ontem = new Date(Date.UTC(ano, mes - 1, dia));
      ontem.setUTCDate(ontem.getUTCDate() - 1);
      console.log("ontem:", ontem);

      const y = String(ontem.getUTCFullYear());
      const m = String(ontem.getUTCMonth() + 1).padStart(2, "0");
      const d = String(ontem.getUTCDate()).padStart(2, "0");
      const ontemKey = `${y}-${m}-${d}`;

      // --- 2) Busca todos os agendamentos por unidade ---
      const db = admin.database();
      const snapUnidades = await db
          .ref("DRM/agendamentoWhatsApp/operacional" +
            "/consultasAgendadas/unidades")
          .once("value");
      await db.ref("/DRM/agendamentoWhatsApp/operacional" +
        "/pesquisaSatisfacao/AEnviar").set(null);
      const unidades = snapUnidades.val();

      let totalAgendadosOntem = 0;
      const writes = [];

      // --- 3) Para cada unidade, olha se existe a data de ontem ---
      Object.keys(unidades).forEach((nomeUnidade) => {
        const datasAgendadas = unidades[nomeUnidade];
        if (!datasAgendadas) {
          console.log("Não há registro de datasAgendadas");
          return;
        }

        const datasAgendadasOntem = datasAgendadas[ontemKey];
        if (!datasAgendadasOntem) return;

        // 4) Para cada horário de ontem, copia o objeto para AEnviar com push()
        Object.keys(datasAgendadasOntem).forEach((hora) => {
          const agendamento = datasAgendadasOntem[hora];
          if (!agendamento) {
            console.log("Não há dados de agendamento para o paciente");
            return;
          }
          const destinoRef = db.ref("/DRM/agendamentoWhatsApp/" +
            "operacional/pesquisaSatisfacao/AEnviar")
              .push();
          writes.push(destinoRef.set(agendamento));
          totalAgendadosOntem += 1;
        });
      });
      await Promise.all(writes);
      // resp.status(200).json({status: "ok", ontem: ontemKey,
      //   totalAgendadosOntem,
      // });
      console.log("Total agendados ontem:", totalAgendadosOntem);
      console.log("Data de ontem:", ontemKey);
      return null;
    });


exports.drmPesquisaSatisfacaoZapi =
    functions.database.ref("/DRM/agendamentoWhatsApp/operacional/" +
      "pesquisaSatisfacao/AEnviar/{pushId}")
        .onWrite(async (change, context) => {
          //
          if (!change.after.exists()) {
            return null;
          }
          console.log("Entrou drmPesquisaSatisfacaoZapi");

          try {
            const element = change.after.val();
            console.log("element:" + JSON.stringify(element));

            let paciente = "";
            if (element.nomePaciente) {
              paciente = element.nomePaciente;
            }
            // console.log("paciente: " + paciente);

            let telPaciente;
            if (element.telefone) {
              telPaciente = element.telefone;
            }
            // console.log("telPaciente: " + telPaciente);

            let unidade = "";
            if (element.unidade) {
              unidade = element.unidade;
            }
            // console.log("unidade: " + unidade);

            let data = "";
            if (element.dataAgendamento) {
              data = element.dataAgendamento;
            }
            // console.log("data: " + data);

            let horario = "";
            if (element.horaAgendamento) {
              horario = element.horaAgendamento;
            }
            // console.log("horario: " + horario);

            let convenio = "";
            if (element.convenio) {
              convenio = element.convenio;
            }
            // console.log("convenio: " + convenio);

            let exames = "";
            if (element.exames) {
              exames = element.exames;
            }
            // console.log("exames: " + exames);

            if (telPaciente) {
              let parametros = {};

              if (ambiente == "teste") {
                // telPaciente = "5521997975125";
                telPaciente = "5521971938840";
                parametros = {
                  id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                  token: "A8F754F1402CAE3625D5D578",
                };
              } else {
                parametros = {
                  id: "3D460A6CB6DA10A09FAD12D00F179132",
                  token: "1D2897F0A38EEEC81D2F66EE",
                };
              }
              console.log("telPaciente ao enviar:", telPaciente);

              const message1 = "Olá, tudo bem? 😊" +
              "\n\nAqui é do Dr. Melo. Gostaríamos de saber " +
              "como foi sua experiência no atendimento abaixo:" +
              "\n\n*Paciente:* " + paciente +
              "\n*Unidade:* " + unidade +
              "\n*Data:* " + data +
              "\n*Hora:* " + horario +
              "\n*Convênio:* " + convenio +
              "\n*Exames:* " + exames +
              "\n\nGostou?" +
              "\nNão gostou?" +
              "\nOu não pode comparecer?" +
              "\n\nSua opinião é muito importante para nós!";

              const doc = await admin.firestore()
                  .collection("historicoDaConversa")
                  .doc(telPaciente).get();

              let glbHistoricoDaConversa = null;
              if (doc.exists) {
                // console.log("Documento existe:", doc.id);
                glbHistoricoDaConversa = doc.data().glbHistoricoDaConversa;
              }
              // console.log("glbHistoricoDaConversa:", glbHistoricoDaConversa);
              glbHistoricoDaConversa.push(
                  {role: "assistant", content: message1});
              await admin.firestore().collection("historicoDaConversa")
                  .doc(telPaciente).set({glbHistoricoDaConversa});


              const arrMessage = [{
                "phone": telPaciente,
                "message": message1,
              }];

              const i = 0;
              callZapiV3(arrMessage, parametros, i);

              console.log("Mensagem enviada com sucesso");
              return null;
            }
          } catch (erro) {
            console.error("❌ Erro ao enviar mensagem de pesquisa:", erro);
            return null;
          }
        });


// ----------------------

exports.drmConfirmacaoPacientesBtActions = functions
    .https.onRequest(async (req, res) => {
      console.log("Entrou no drmConfirmacaoPacientesBtActions");
      const {telefone, unidade, data, hora, paciente, convenio,
        endereco, telUnidade, diaSemana, acao} = req.query;

      if (!telefone || !unidade || !data || !hora) {
        return res.status(400).send("Parâmetros faltando");
      }

      const db = admin.database();
      // let aConfirmar = {};
      let script = "";
      let script2 = "";

      // Converte DD/MM/AAAA → AAAA-MM-DD (formato das chaves no RTDB)
      const dateKey = data
          .includes("/") ? data
              .split("/").reverse().join("-") : data;

      const agendadosRef = db
          .ref("DRM/agendamentoWhatsApp/operacional/consultasAgendadas");
      const canceladosRef = db
          .ref("DRM/agendamentoWhatsApp/operacional/consultasCanceladas");

      const telefonePath = `telefones/${telefone}/${dateKey}/${hora}`;
      const unidadePath = `unidades/${unidade}/${dateKey}/${hora}`;
      console.log("telefone:" + telefone);

      // Agendamento
      const agTelSnap = await agendadosRef.child(telefonePath).once("value");
      const agUniSnap = await agendadosRef.child(unidadePath).once("value");
      const agDadosUnidade = agUniSnap.val();
      // const agDadosTelefone = agTelSnap.val();

      // Cancelamento
      const canTelSnap = await canceladosRef.child(telefonePath).once("value");
      const canUniSnap = await canceladosRef.child(unidadePath).once("value");
      const canDadosUnidade = canUniSnap.val();
      console.log("canDadosUnidade: " + JSON.stringify(canDadosUnidade));

      // const canDadosTelefone = canTelSnap.val();

      try {
        const telefoneUnidade = telUnidade;
        const telefonePaciente = telefone;

        // configuração para envio de mensagem
        let parametros = {};

        if (ambiente == "teste") {
          // whatsAppCel = "5521997975125"; // tel vermelho
          // whatsAppCel = "5521984934862"; // Alexandre

          // telefoneUnidade = "5521971938840"; // Gabriel;
          // telefonepaciente = "5521971938840"; // Gabriel;
          parametros = {
            id: "3B74CE9AFF0D20904A9E9E548CC778EF",
            token: "A8F754F1402CAE3625D5D578",
          };
        } else {
          parametros = {
            id: "3D460A6CB6DA10A09FAD12D00F179132",
            token: "1D2897F0A38EEEC81D2F66EE",

          };
        }
        //
        if (acao === "confirmarConsulta") {
          //
          console.log("Paciente clicou em 'Confirmar'");

          const msgConfirmaUnidade =
            "✅ *Paciente Confirmou que Comparecerá*" +
            "\n*Nome:* " + paciente +
            "\n*Data/Hora:* " + diaSemana + " " + data + " às " + hora +
            "\n*Convenio:* " + convenio +
            "\n*Unidade:* " + unidade +
            "\n*Telefone:* " + telefonePaciente;

          const msgConfirmaPaciente =
            "Olá 👋 *" + paciente + "*!" +
            "\n\nSua consulta foi confirmada para *" + diaSemana +
            "*, dia *" + data + "* às *" + hora + "*." +
            "\nSerá um prazer atendê-lo! 😊";


          const arrMessage = [
            {
              phone: telefoneUnidade,
              message: msgConfirmaUnidade,
            },
            {
              phone: telefonePaciente,
              message: msgConfirmaPaciente,
            },
          ];

          if (agTelSnap.exists() || agUniSnap.exists()) {
            //
            console.log("Agendamento existe");

            if (!(agDadosUnidade.confirmado)) {
              //
              console.log("Agendamento não 'confirmado:true' ");

              await agendadosRef.update({
                [`${telefonePath}/confirmado`]: true,
                [`${unidadePath}/confirmado`]: true,
              });

              // enviar mensagem Zapi
              const i = 0;
              callZapiV3(arrMessage, parametros, i);
            //
            } else {
              //
              console.log("Já estava confirmado " +
                "existe 'confirmado:true'- ignorar");
            }
            //
          } else {
            //
            console.log("Paciente está cancelado e quer confirmar");

            canDadosUnidade.confirmado = true;
            canDadosUnidade.motivoCancelamento = null;

            // restaura em agendados para telefone e unidade
            await agendadosRef.child(telefonePath).set(canDadosUnidade);
            await agendadosRef.child(unidadePath).set(canDadosUnidade);

            // só depois remove dos cancelados
            await canceladosRef.child(telefonePath).remove();
            await canceladosRef.child(unidadePath).remove();

            const i = 0;
            callZapiV3(arrMessage, parametros, i);
          }

          script = `<!-- Ícone de sucesso -->
            <div class="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg"
                  class="h-16 w-16 text-green-500"
                  fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M9 12l2 2 4-4M12 22C6.477 
                            22 2 17.523 2 12S6.477 2 12 2s10 4.477
                            10 10-4.477 10-10 10z"/>
              </svg>
            </div>`;
          script2 = `Agendamento Confirmado!`;
        }
        //
        if (acao === "cancelarConsulta") {
          //
          console.log("Paciente clicou em cancelar");

          const msgCancelamentoPaciente =
            "Olá 👋 *" + paciente + "*!" +
            "\n\nSua consulta foi *cancelada* !" +
            "\n\nGostaria de reagendar?";


          const arrMessage = [
            {
              phone: telefonePaciente,
              message: msgCancelamentoPaciente,
            },
          ];

          if (canTelSnap.exists() || canUniSnap.exists()) {
            //
            console.log("dados paciente no cancelamento existe");
            console.log("canDadosUnidade: " + JSON.stringify(canDadosUnidade));

            if (!(canDadosUnidade.motivoCancelamento)) {
              console.log("Paciente já cencelado mas " +
                "sem o motivo do cancelamento");

              await canceladosRef.update({
                [`${telefonePath}/motivoCancelamento`]:
                      "Cancelado pelo paciente na confirmacao",
                [`${unidadePath}/motivoCancelamento`]:
                      "Cancelado pelo paciente na confirmacao",
              });
              // enviar mensagem Zapi
              const i = 0;
              callZapiV3(arrMessage, parametros, i);
              //
            } else {
              console.log("Já estava cancelado e com motivo " +
                "do cancelamento — ignorando");
            }
          } else {
            console.log("Paciente Agendado, deve ser cancelado");

            agDadosUnidade.confirmado = null;
            agDadosUnidade.motivoCancelamento =
                "Cancelado pelo paciente na confirmacao";

            // restaura em agendados para telefone e unidade
            await canceladosRef.child(telefonePath).set(agDadosUnidade);
            await canceladosRef.child(unidadePath).set(agDadosUnidade);

            // só depois remove dos cancelados
            await agendadosRef.child(telefonePath).remove();
            await agendadosRef.child(unidadePath).remove();

            // enviar mensagem Zapi
            const i = 0;
            callZapiV3(arrMessage, parametros, i);
          }

          script = `<!-- Ícone de cancelamento -->
          <div class="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 text-red-600"
                fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>`;
          script2 = `Agendamento Cancelado!`;
        }
        return res.status(200).send(`<!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, 
          initial-scale=1.0"/>
          <title>Validação Concluída</title>
          <!-- CDN oficial do Tailwind -->
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-white flex items-start 
        justify-center min-h-screen pt-16 p-4">
          <div class="max-w-md w-full">
            <!-- Cabeçalho em texto, fonte maior -->
            <div class="flex flex-col items-center mb-6">
              <h1 class="text-5xl font-extrabold text-blue-800 
              leading-tight">Dr.Melo</h1>
              <p class="text-xl text-blue-600 mt-1">
              Seu Oftalmologista perto de você</p>
            </div>

            <!-- Caixa de confirmação com borda azul escuro a cima -->
            <div class="bg-white border-4 border-blue-800 
            rounded-xl shadow-lg p-6 text-center -mt-4">
              <!-- Ícone de sucesso ou cancelamento -->
              ${script}
              <!-- Título da confirmação ou do cancelamento-->
              <h2 class="text-2xl font-semibold text-blue-800 mb-2">
                ${script2}
              </h2>
              <!-- Mensagem detalhada -->
              <p class="text-gray-700 text-left">
                <strong>Paciente:</strong> ${paciente} <br>
                <strong>Convenio:</strong> ${convenio} <br>
                <strong>Data:</strong> ${data} <br>
                <strong>Hora:</strong> ${hora} <br>
                <strong>Unidade:</strong> ${unidade} <br>
                <strong>Endereço:</strong> ${endereco} <br>
              </p>
            </div>
          </div>
        </body>
        </html>`);
      } catch (err) {
        console.error("Erro ao validar ou cancelar:", err);
        return res.status(500).send("Erro interno");
      }
    });
exports.drmConfirmacaoPacientesJson = functions.pubsub
    .schedule("00 07 * * 1-5")
    .timeZone("America/Sao_Paulo")
    .onRun(async (context) => {
      // exports.drmConfirmacaoPacientesJson = functions.https
      //     .onRequest(async (req, resp) => {
      console.log("Entrou drmConfirmacaoPacientesJson");

      /* ───────── 1. Verifica dia da semana ───────── */
      const hoje = new Date();
      const diaSemana = hoje.getDay(); // 0=Dom … 5=Sex

      /* ───────── 2. Monta array de datas-alvo (string “aaaa-mm-dd”) ──── */
      const datasAlvo = [];
      const somaData = (dias) => {
        const d = new Date(hoje);
        d.setDate(d.getDate() + dias);

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      };

      if (diaSemana === 5) {
        // Hoje é sexta → sábado (+1) e segunda (+3)
        datasAlvo.push(somaData(1));
        datasAlvo.push(somaData(3));
      } else {
        // Qualquer outro dia útil → só amanhã (+1)
        datasAlvo.push(somaData(1));
      }

      console.log("Datas-alvo:", datasAlvo);

      /* ───────── 3. Caminhos do RTDB ───────── */
      const db = admin.database();
      const refUnidades = db.ref(
          "DRM/agendamentoWhatsApp/operacional/consultasAgendadas/unidades");
      const refAEnviar = db.ref(
          "DRM/agendamentoWhatsApp/operacional/confirmacaoPacientes/aEnviar");

      try {
        /* ───────── 4. Limpa nó e carrega todas as unidades ───────── */
        await refAEnviar.set(null);
        const unidades = await (await refUnidades.once("value")).val() || {};
        console.log("unidades: " + JSON.stringify(unidades));
        let total = 0;

        /* ───────── 5. Percorre cada unidade e verifica as datas-alvo ───── */
        Object.values(unidades).forEach((porData) => {
          datasAlvo.forEach((chave) => {
            const consultas = porData[chave];
            if (!consultas) return; // não existem agendamentos para esta data

            Object.values(consultas).forEach((dados) => {
              refAEnviar.push(dados); // empilha o objeto inteiro
              total++;
            });
          });
        });
        console.log(`→ Fim: ${total} registro(s)`);
        // resp.end(`Consultas para: ${total} registro(s)`);
        return null;
      } catch (erro) {
        console.error("Erro:", erro);
        // resp.status(500).end("Erro interno");
        return null;
      }
    });

exports.drmConfirmacaoPacientesZapi =
    functions.database.ref("DRM/agendamentoWhatsApp/" +
      "operacional/confirmacaoPacientes/aEnviar/{pushId}")
        .onWrite(async (change, context) => {
          console.log("Entrou drmAvisoConsultaAgendadaZapi");

          if (!change.after.exists()) {
            return null;
          }
          const element = change.after.val();
          console.log("element:", JSON.stringify(element));

          let paciente = "";
          let dataAgendada = "";
          let horaAgendada = "";
          let convenio = "";
          let whatsAppCel = "";
          let unidade = "";
          let endereco = "";
          let telUnidade = "";
          const db = admin.database();

          if (element.nomePaciente) {
            paciente = element.nomePaciente;
          }
          if (element.dataAgendada) {
            dataAgendada = element.dataAgendada;
          }
          if (element.horaAgendada) {
            horaAgendada = element.horaAgendada;
          }
          if (element.convenio) {
            convenio = element.convenio;
          }
          if (element.unidade) {
            unidade = element.unidade;

            const endSnap = await db
                .ref("DRM/agendamentoWhatsApp/configuracoes/unidades/"+ unidade)
                .child("endereco")
                .once("value");
            const teldSnap = await db
                .ref("DRM/agendamentoWhatsApp/configuracoes/unidades/"+ unidade)
                .child("whatsApp")
                .once("value");
            endereco = endSnap.val() || "";
            telUnidade = teldSnap.val() || "";
          }
          if (element.telefone) {
            // whatsAppCel == telefone do paciente que recebe msg de confirmacao
            whatsAppCel = element.telefone;
          }

          // Converte "DD/MM/AAAA" → Date
          const parseDateBr = (str) => {
            const [d, m, y] = str.split("/");
            return new Date(y, m - 1, d);
          };

          // Retorna o dia da semana em PT-BR
          const diaSemanaDe = (dataStr) => {
            if (!dataStr) return "";
            const dias = [
              "Domingo",
              "Segunda",
              "Terça",
              "Quarta",
              "Quinta",
              "Sexta",
              "Sabado",
            ];
            return dias[parseDateBr(dataStr).getDay()];
          };
          const diaSemana = diaSemanaDe(dataAgendada);


          console.log("whatsAppCel: " + whatsAppCel);
          if (whatsAppCel) {
            //
            if (whatsAppCel) {
              let parametros = {};
              let ambienteLink = "";

              if (ambiente == "teste") {
                ambienteLink = "teste-b720c";

                // whatsAppCel = "5521997975125"; // tel vermelho
                // whatsAppCel = "5521984934862"; // Alexandre
                // whatsAppCel = "5521971938840"; // Gabriel;
                parametros = {
                  whatsAppCel: whatsAppCel,
                  id: "3B74CE9AFF0D20904A9E9E548CC778EF",
                  token: "A8F754F1402CAE3625D5D578",
                };
              } else {
                ambienteLink = "oftautomacao-9b427";

                parametros = {
                  whatsAppCel: whatsAppCel,
                  id: "3D460A6CB6DA10A09FAD12D00F179132",
                  token: "1D2897F0A38EEEC81D2F66EE",
                };
              }

              // === Gera o link de validação (fixo)
              const auxLink =
                "https://us-central1-" + ambienteLink + ".cloudfunctions.net/" +
                "drmConfirmacaoPacientesBtActions" +
                `?telefone=${encodeURIComponent(whatsAppCel)}` +
                `&unidade=${encodeURIComponent(unidade)}` +
                `&data=${encodeURIComponent(dataAgendada)}` +
                `&hora=${encodeURIComponent(horaAgendada)}` +
                `&paciente=${encodeURIComponent(paciente)}` +
                `&convenio=${encodeURIComponent(convenio)}` +
                `&endereco=${encodeURIComponent(endereco)}` +
                `&telUnidade=${encodeURIComponent(telUnidade)}` +
                `&diaSemana=${encodeURIComponent(diaSemana)}`;

              const confirmarLink = auxLink + "&acao=confirmarConsulta";

              const cancelarLink = auxLink + "&acao=cancelarConsulta";

              let message1 = "";
              message1 = "Olá! Aqui é do Dr. Melo" +
              "\n\nGostaríamos de confirmar o agendamento abaixo:" +
              "\n*Paciente:* " + paciente +
              "\n*Data:* " + diaSemana + " " + dataAgendada +
              "\n*Hora:* " + horaAgendada +
              "\n*Unidade:* " + unidade +
              "\n*Plano:* " + convenio +
              "\n*Endereço:* " + endereco +
              "\n\n Por favor, confirme a consulta do paciente";

              if (ambiente == "teste") {
                message1 = whatsAppCel + "\n\n" + message1;
              }
              const arrMessage = [
                {
                  phone: whatsAppCel,
                  message: message1,
                  buttonActions: [
                    {
                      type: "URL",
                      url: confirmarLink,
                      label: "Confirmar Consulta",
                    },
                    {
                      type: "URL",
                      url: cancelarLink,
                      label: "Cancelar Consulta",
                    },
                  ],
                },
              ];
              const i = 0;
              callZapiV3(arrMessage, parametros, i);
            }
          }
          return null;
        });


// ---- fim novo programa
// *************************************************************************
// *************************************************************************
// *************************************************************************

// const functions = require("firebase-functions");
const {google} = require("googleapis");
// const e = require("express");
// const {firebase} = require("googleapis/build/src/apis/firebase");
// const {Console} = require("console");
// const {json} = require("stream/consumers");
// const {object} = require("firebase-functions/v1/storage");

// Configuração da API do Gmail
// const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const GMAIL_USER = "me"; // 'me' refere-se ao usuário autenticado

// Função para autenticação com OAuth2
const getOAuth2Client = async () => {
  const {clientId, clientSecret, redirectUris} =
      require("./credentials.json").web;
  const oAuth2Client = new google.auth
      .OAuth2(clientId, clientSecret, redirectUris[0]);

  // Substitua pelo token gerado manualmente para a conta
  const token = require("./token.json");
  // Gere este token manualmente uma vez
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
};

// Função HTTP do Firebase
exports.getUnreadEmails = functions.https.onRequest(async (req, res) => {
  try {
    const auth = await getOAuth2Client();
    const gmail = google.gmail({version: "v1", auth});

    // Buscar emails não lidos
    const response = await gmail.users.messages.list({
      userId: GMAIL_USER,
      q: "is:unread", // Busca emails não lidos
    });

    const messages = response.data.messages || [];
    if (messages.length === 0) {
      console.log("Nenhuma mensagem não lida encontrada.");
      return res.status(200).send("Nenhuma mensagem não lida encontrada.");
    }

    // Processar cada mensagem
    for (const message of messages) {
      const msg = await gmail.users.messages.get({
        userId: GMAIL_USER,
        id: message.id,
      });

      const headers = msg.data.payload.headers;
      const subjectHeader = headers.find((header) => header.name === "Subject");
      const subject = subjectHeader ? subjectHeader.value : "Sem assunto";
      const body = msg.data.snippet || "Sem corpo";

      console.log(`Assunto: ${subject}`);
      console.log(`Corpo: ${body}`);
    }

    res.status(200).send("Emails não lidos processados. Verifique os logs.");
  } catch (error) {
    console.error("Erro ao acessar emails:", error);
    res.status(500).send("Erro ao acessar emails.");
  }
});

// const functions = require("firebase-functions");
// const { google } = require("googleapis");

// Configurações da API do Gmail
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const {clientId, clientSecret, redirectUris} =
       require("./credentials.json").web;

// Função HTTP para obter o token
exports.getAccessToken = functions.https.onRequest(async (req, res) => {
  const oAuth2Client =
     new google.auth.OAuth2(clientId, clientSecret, redirectUris[0]);

  // Se não houver "code" na URL, redirecione para a URL de autorização
  if (!req.query.code) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    res.status(200).send(`
      <h1>Autorize o aplicativo</h1>
      <p>Autorize este aplicativo acessando o link abaixo:</p>
      <a href="${authUrl}" target="_blank">Clique aqui para autorizar</a>
      <p>Após autorizar, você será redirecionado 
      para uma página onde receberá o "code". Cole o 
      código na URL desta página no formato <code>?
      code=SEU_CÓDIGO</code>.</p>
    `);
    return;
  }

  // Se "code" estiver presente, troque-o por um token
  const code = req.query.code;
  try {
    const {tokens} = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Exibir o token no navegador
    res.status(200).send(`
      <h1>Token Obtido com Sucesso</h1>
      <p>Abaixo está o token OAuth2:</p>
      <pre>${JSON.stringify(tokens, null, 2)}</pre>
      <p>Copie e use este token no seu aplicativo.</p>
    `);
  } catch (error) {
    console.error("Erro ao obter o token:", error);
    res.status(500).send("Erro ao obter o token. Verifique os logs.");
  }
});

// método de ativação da function pamEnviarWhatsApp abaixo:
// https://us-central1-oftautomacao-9b427.cloudfunctions.net/
// pamEnviarWhatsApp?phone=5521971938840&text=Ol%C3%A1+Oftalmo+Day%21+
// Te+contactei+pelo+site+na+p%C3%A1gina+da+Home

exports.pamEnviarWhatsApp = functions.https.onRequest((req, resp) => {
  let whatsAppCel = req.query.phone;
  const message1 = req.query.text;

  console.log("Entrou enviarWhatsApp");

  // if (ambiente == "teste") whatsAppCel = "5521971938840";
  whatsAppCel = tel2Whats(whatsAppCel);

  if (whatsAppCel) {
    let parametros = {};
    if (ambiente == "teste") {
      parametros = {
        whatsAppCel: whatsAppCel,
        id: "3B74CE9AFF0D20904A9E9E548CC778EF",
        token: "A8F754F1402CAE3625D5D578",
      };
    } else {
      parametros = {
        whatsAppCel: whatsAppCel,
        id: "3D460A6CB6DA10A09FAD12D00F179132",
        token: "1D2897F0A38EEEC81D2F66EE",
      };
    }

    // message1 = "Boa tarde! Tudo bem?";

    const arrMessage = [{
      "phone": whatsAppCel,
      "message": message1,
    }];

    const i = 0;
    callZapiV3(arrMessage, parametros, i);
  }
  // return null;
  resp.end("Ok"+resp.status.toString());
});

exports.drmProcessarLead = functions.https.onRequest((req, resp) => {
  console.log("Entrou drmProcessarLead");
  // let whatsAppCel = req.query.telefone;
  // const message1 = req.query.text;
  console.log("req.body: " + JSON.stringify(req.body));
  console.log("req.query: " + JSON.stringify(req.query));

  // whatsAppCel = tel2Whats(whatsAppCel);

  // resp.end("Okkkkk"+resp.status.toString());
  // resp.redirect(301, "https://wa.me/" + whatsAppCel + "?text=Ola");
  resp.redirect("https://wa.me/5521971938840?text=Oi");
});

// *********************************************************************
// *********************************************************************
// *********************************************************************
// *********************************************************************

// *********************************************************************
//         mensagem de confirmação webhok consulta via WhatsApp
// *********************************************************************

exports.metaWebhook = functions.https.onRequest((req, res) => {
  //
  const VERIFY_TOKEN = "EAASy47UeDpQBPFBlxVeD2ZCnhV2Tvxeij399Niuc3" +
    "JSQSfO9cIySFi94gZCaEEGHZBYqzOZBAqjdZCM5ZBN" +
    "XxBPps4e1jZCgMlcZAiQjM1SuGUCObTa4JsbfNjAuJ" +
    "JXnCSOcZBZAxe6JoojTbqTWBZBtirGBTD95eaZCbeIU" +
    "39lHMqUqaF61siFiOpTkZAT6UlgcSoDvQWwZDZD";

  /* =====================================================
     1) VERIFICAÇÃO GET  (Meta faz isso só 1 vez no cadastro)
     ===================================================== */
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK VERIFICADO");
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  /* =====================================================
     2) RECEPÇÃO DE MENSAGENS POST
     ===================================================== */
  const body = req.body;
  // console.log("Webhook recebido:", JSON.stringify(body, null, 2));
  console.log("Webhook recebido:", JSON.stringify(body));
  console.log("req.method:", JSON.stringify(req.method));
  console.log("req.query:", JSON.stringify(req.query));

  if (
    body &&
    body.entry && body.entry.length > 0 &&
    body.entry[0].changes && body.entry[0].changes.length > 0 &&
    body.entry[0].changes[0].value &&
    body.entry[0].changes[0].value.messages &&
    body.entry[0].changes[0].value.messages.length > 0
  ) {
    const change = body.entry[0].changes[0].value;
    const message = change.messages[0];
    const from = message.from; // nº de telefone do paciente
    const phoneNumberId = change.metadata.phone_number_id; // nº WA do paciente
    const userText = (message.text && message.text.body) ?
                           message.text.body : "";

    console.log("Conteúdo de message:", JSON.stringify(message));
    console.log("Valor de from (wa_id):", from);
    if (from && phoneNumberId) {
      //
      const replyBody = {
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: {body: `Olá! Recebemos sua mensagem, você disse: ${userText}`},
      };

      /* ------ envia para a API do WhatsApp ------ */
      const options = {
        hostname: "graph.facebook.com",
        path: `/v19.0/${phoneNumberId}/messages`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${VERIFY_TOKEN}`,
        },
      };

      const wpReq = https.request(options, (wpRes) => {
        wpRes.on("data", () => {}); // ignoramos o corpo da resposta
      });

      wpReq.on("error", (err) => console.error("Erro ao enviar WA:", err));
      wpReq.write(JSON.stringify(replyBody));
      wpReq.end();

      console.log("Resposta enviada para", from);
    } else {
      console.log("Campos obrigatórios ausentes - nada foi respondido.");
    }
  } else {
    console.log("Não havia mensagem de usuário neste webhook.");
  }

  return res.sendStatus(200);
});

// *********************************************************************
//          mensagem de confirmação de consulta via WhatsApp
// *********************************************************************
exports.sendWaMessage = functions.https.onRequest((req, res) => {
  //

  // --- validação
  // const body = req.body;
  // if (!body || !body.to || !body.message) {
  //   res.status(400).send("Parâmetros obrigatórios: to, message");
  //   return;
  // }

  const accessToken = "EAAI7l3ZA1j1YBPOam" +
    "t1XXkedXUXrQCtSgqAPZCPZBoba9IX0gJPhhhoGCassrg0F2p57GBP9sPEncaa" +
    "y8oYviC7UspU5ZAeRzJ4WazPQ8eG7my8o1ZBk3F2lxaOHfxrVCjDmFf14tehZA" +
    "pC1GHQcFBWoABuH73ryRybrJPlJNBnecP3UfVDNjc46zIGqQ7khLflAZDZD";

  const phoneNumberId = "691264807409202"; // ID do nº comercial
  const numeroPaciente = "5521971938840"; // número do paciente
  // const IDMarcacao = "123456789"; // ID da marcação
  const paciente = "João da Silva"; // nome do paciente
  const mensagem = "Olá " + paciente + " Sua consulta está marcada";


  // ---- monta payload ----
  // const payload = JSON.stringify({
  //   messaging_product: "whatsapp",
  //   to: "5521971938840", // numero do paciente do paciente
  //   type: "text",
  //   text: {body: mensagem},
  // });

  const payload = JSON.stringify({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: numeroPaciente, // número do paciente
    type: "interactive",
    interactive: {
      type: "button", // tipo do template
      body: { // texto principal
        text: mensagem, // menagem principal
      },
      action: { // lista de botões
        buttons: [
          {
            type: "reply",
            reply: {
              id: "CNFSIM-123456", // ID que você tratará no webhook
              title: "✅ Confirmar Consulta",
            },
          },
          {
            type: "reply",
            reply: {
              id: "CNFNAO-123456",
              title: "❌ Cancelar Consulta",
            },
          },
        ],
      },
    },
  });

  const options = {
    hostname: "graph.facebook.com",
    path: `/v19.0/${phoneNumberId}/messages`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + accessToken,
    },
  };

  // ---- chamada HTTPS ----
  const fbReq = https.request(options, (fbRes) => {
    let buff = "";
    fbRes.on("data", (chunk) => buff += chunk);
    fbRes.on("end", () => {
      console.log("Resposta Facebook:", buff);
    });
  });

  fbReq.on("error", (err) => {
    console.error("Erro ao enviar WhatsApp:", err);
    res.status(500).send("Erro ao enviar WhatsApp");
  });

  fbReq.write(payload);
  fbReq.end();
  res.status(200).send("Mensagem enviada");
});

// *********************************************************************

// const axios = require("axios");

// exports.requestCode = functions.https.onRequest(async (req, res) => {
//   // ====== CONFIG ======
//   const GRAPH_VERSION = "v23.0";
//   const PHONE_NUMBER_ID = "779376061914800";
//   const ACCESS_TOKEN = "EAASy47UeDpQBPFBlxVeD" +
//     "2ZCnhV2Tvxeij399Niuc3JSQSfO9" +
//     "cIySFi94gZCaEEGHZBYqzOZBAqjd" +
//     "ZCM5ZBNXxBPps4e1jZCgMlcZAiQj" +
//     "M1SuGUCObTa4JsbfNjAuJJXnCSOcZ" +
//     "BZAxe6JoojTbqTWBZBtirGBTD95ea" +
//     "ZCbeIU39lHMqUqaF61siFiOpTkZAT6" +
//     "UlgcSoDvQWwZDZD"; // token permanente

//   const METHOD = "sms"; // ou "voice"
//   const LANGUAGE = "pt_BR"; // idioma da mensagem

//   // ====== CORPO DA REQUISIÇÃO ======
//   const body = {
//     method: METHOD,
//     language: LANGUAGE,
//   };

//   // ====== CHAMADA HTTPS ======
//   const url = "https://graph.facebook.com/" +
//               GRAPH_VERSION + "/" +
//               PHONE_NUMBER_ID + "/request_code";

//   try {
//     const fbResp = await axios.post(url, body, {
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": "Bearer " + ACCESS_TOKEN,
//       },
//     });
//     res.json({ok: true, data: fbResp.data});
//   } catch (err) {
//     const detail = err.response ? err.response.data : err.message;
//     res.status(500).json({ok: false, error: detail});
//   }
// });

exports.requestCode = functions.https.onRequest(async (req, res) => {
  console.log("Entrou requestCode");

  let postData = "";
  let postDataObj = {};

  const request = new XMLHttpRequest();

  try {
    const certificado = "CoMBCj8In5n5kKuwwAMSBmVudDp3YSIm" +
      "T2Z0YWxtbyBEYXkg4oCTIERyIEFudG9uaW8gTG9ibyB0ZXN0ZT" +
      "JQ7pqFxAYaQJQHO4YlANweaTH8KflWRMhHqhV96TbMabgbITBr" +
      "jSOZ7NIZybQLD/x8T0IG858x6Xj7wz1pDoGJHDtx+BU6+gISMG" +
      "0UaOH9yIz08Fqzt52ubCCSWOHgWc32Kl4iG81JOtxenFpnyRqV" +
      "PSvPVgm031PZsQ==";

    postDataObj = {
      "cc": "55",
      "phone_number": "21972555867",
      "method": "sms",
      "cert": certificado,
      "pin": "",
    };

    postData = JSON.stringify(postDataObj);


    const url = "https://graph.facebook.com/v1/1429610851609994";
    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json");

    console.log("New postData "+ postData);
    request.send(postData);
    request.onload = () => {
      if (request.status == 200) {
        console.log("Z-API chamado com sucesso.");
      } else {
        console.log("Erro chamando Z-API. [callZapiV3]");
        return null;
      }
    };
  } catch (err) {
    console.error("💥 Erro inesperado:", err);
    return res.status(500).send("Erro inesperado", err);
  }
});
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// functions/index.js
const os = require("os");
// const { Console } = require("console");

// const openai = new OpenAI({
//     apiKey: "sk-proj-QGH3tRjLTDV2J3ucOKOFzNEYmZmql_" +
//         "OLeJ0JJFfn_tv7OyY9u_RTojVkmn07A3S63n_" +
//         "IrWpV2JT3BlbkFJWNjY2hcy7jzBoWfFNl_" +
//         "CCgmlAqaN_pSe3WPRFV3Y0AYb-q1DQDpXqTfsKcOfeU__" +
//         "-ZjGo1iosA",
// });


exports.chamarTranscribeAudio = functions.https.onRequest(async (req, res) => {
  console.log("Entrou chamarTranscribeAudio");

  console.log("req.body:", JSON.stringify(req.body, null, 2));

  if (req.method !== "POST") {
    res.set("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const msg = req.body;
  const audioUrl = msg.audio.audioUrl;


  if (!audioUrl) {
    console.log("Payload inválido: faltando message.url");

    return res
        .status(400)
        .json({error: "Payload inválido: faltando message.url"});
  }
  if (!openai) {
    console.error("OPENAI_API_KEY não configurada.");
    return res.status(500).json({
      error:
        "OPENAI_API_KEY não configurada. Defina via env OU firebase " +
        "functions:config:set openai.key=\"SUA_KEY\"",
    });
  }
  const transcricao = await transcribeAudio(audioUrl, msg);
  console.log("Transcrição em chamarTranscribeAudio:", transcricao);

  return res.json({
    idMessage: msg && msg.idMessage,
    type: msg && msg.type,
    transcription: transcricao,
  });
});


/**
 * @async
 * @function transcribeAudio
 * @param {string} audioUrl URL pública do arquivo de áudio
 * @param {Object} msg Objeto original do webhook (usado para logs/metadata).
 * @return {Promise<string>} Texto transcrito do áudio
 */
async function transcribeAudio(audioUrl, msg) {
  console.log("Entrou transcribeAudio");

  // Mapeia Content-Type -> extensão de arquivo
  const mimeToExt = {
    "audio/ogg": "ogg",
    "audio/opus": "ogg",
    "video/ogg": "ogg",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/webm": "webm",
  };

  try {
    //
    console.log("Baixando áudio:", audioUrl);

    // 1) Baixa o arquivo como buffer
    const dl = await axios.get(audioUrl, {responseType: "arraybuffer"});
    const contentType = (dl.headers["content-type"] || "").toLowerCase();
    const ext = mimeToExt[contentType] || "ogg";

    // 2) Salva no /tmp da Cloud Function
    const tmpPath = path.join(os.tmpdir(), `zapi-audio-${Date.now()}.${ext}`);
    fs.writeFileSync(tmpPath, Buffer.from(dl.data));
    console.log(
        `Áudio salvo em ${tmpPath} (content-type: ${contentType ||
         "desconhecido"})`);

    // 3) Envia para a OpenAI (Whisper)
    const fileStream = fs.createReadStream(tmpPath);
    const result = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "gpt-4o-mini-transcribe",
      language: "pt",
    });

    // 4) Remove o tmp (assíncrono)
    fs.unlink(tmpPath, (e) => e && console.warn("Falha ao remover tmp:", e));

    console.log("Transcrição:", result.text);

    return result.text;
  } catch (err) {
    console.error(
        "Erro ao transcrever áudio:",
        err.response.data || err.message,
        err.stack);
    console.log("error: Erro interno no servidor");
    return null;
  }
}

exports.reqBory = functions.https.onRequest(async (req, res) => {
  console.log("Entrou reqBory");

  // console.log("req.body:", JSON.stringify(req.body, null, 2));
  console.log("req.body:", JSON.stringify(req.body));
  res.and("finalizou programa");
});

// ------------------------------- transcrever imagem ------------------

/**
 * @async
 * @function lerImagem
 * @param {string} imageUrl URL pública da imagem enviada no WhatsApp
 * @param {Object} msg Objeto original do webhook (usado só para logs/metadata)
 * @return {Promise<{plano:string, subplano:string}>} JSON com plano e subplano
 */
async function lerImagem(imageUrl, msg) {
  console.log("Entrou lerImagem");
  console.log("imageUrl:", imageUrl);

  try {
    const FALLBACK_PLANO = "plano não identificado";
    const FALLBACK_SUB = "subplano não identificado";

    // const systemPrompt =
    //   "Identifique o PLANO (marca/operadora) e o " +
    //   "SUBPLANO/REDE/PRODUTO (nome secundário) a partir da imagem. " +
    //   "Se não for possível ler ou decidir, preencha ambos " +
    //   "com rótulos de não identificado.";

    const systemPrompt =
  "Você receberá uma imagem de carteirinha/identificação de plano " +
  "de saúde (foto, screenshot ou PDF convertido). " +
  "Sua tarefa é identificar: (1) a OPERADORA (marca principal do plano) e " +
  "(2) o SUBPLANO/REDE (nome do produto, linha, rede ou categoria). " +
  "A operadora pode ser reconhecida por logotipo, nome escrito ou domínio de " +
  "site visível no cartão (ex.: sulamerica.com.br → SulAmérica). " +
  "O subplano/rede é o nome comercial do produto (ex.: Exato, " +
  "Adesão Care V com Reemb PJ, Saúde Top Quarto Rede Nacional, " +
  "Bronze, CR II, Premium, Nacional, etc.). " +
  "REGRA GERAL: 'plano' deve SEMPRE ser a marca/operadora; 'subplano' " +
  "deve ser o nome do produto/rede. Se perceber que vieram invertidos, " +
  "corrija antes de responder. " +
  "QUANDO HOUVER DUAS OU MAIS MARCAS (ex.: CASSI e Grupo Bradesco Saúde), " +
  "priorize como 'plano' a MARCA DE MAIOR DESTAQUE VISUAL na carteirinha " +
  "(logotipo maior, fonte maior, posição central/superior). Trate as demais " +
  "apenas como informação de grupo/administradora e NÃO como 'plano'. " +
  "Exemplos: 'Mediservice' (destacado) sobre " +
  "'Grupo Bradesco Saúde' → plano=Mediservice; " +
  "'CASSI' (destacado) com menção a Bradesco/Grupo → plano=CASSI. " +
  "Considere variações de marca e grupos (ex.: 'Bradesco Saúde', " +
  "'Mediservice', 'Unimed', 'Amil', 'SulAmérica', 'NotreDame/Intermédica', " +
  "'Hapvida', 'Assim', 'Porto', 'Golden Cross', etc.). " +
  "Tolere diferenças de layout, rotação, textos em maiúsculas/minúsculas e " +
  "abreviações; use o contexto visual e textual da imagem. " +
  "RESPOSTA: retorne APENAS um JSON com as chaves { plano, subplano }. " +
  "Se não for possível identificar com segurança, retorne { plano: " +
  "'plano não identificado', subplano: 'subplano não identificado' }.";

    // Responses API: response_format -> text.format (correção!)
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      text: {
        format: {
          type: "json_schema",
          name: "PlanoESubplano",
          strict: true,
          schema: {
            type: "object",
            properties: {
              plano: {type: "string"},
              subplano: {type: "string"},
            },
            required: ["plano", "subplano"],
            additionalProperties: false,
          },
        },
      },
      input: [
        {
          role: "system",
          content: [{type: "input_text", text: systemPrompt}],
        },
        {
          role: "user",
          content: [
            {type: "input_text",
              text: "Retorne um JSON contendo apenas { plano, subplano }."},
            {type: "input_image", image_url: imageUrl,
            },
          ],
        },
      ],
    });

    // Extrai o JSON de saída
    let saida = "";
    if (response && response.output && response.output.length > 0) {
      const content = response.output[0].content;
      if (content && content.length > 0 && content[0].type === "output_text") {
        saida = content[0].text;
      }
    }

    let out = null;
    try {
      out = JSON.parse(saida);
    } catch (e) {
      //
    }

    if (!out || typeof out.plano !== "string" ||
        typeof out.subplano !== "string") {
      return {plano: FALLBACK_PLANO, subplano: FALLBACK_SUB};
    }

    const clean = (s) => String(s).trim().replace(/\s{2,}/g, " ");
    out.plano = clean(out.plano);
    out.subplano = clean(out.subplano);

    if (!out.plano) out.plano = FALLBACK_PLANO;
    if (!out.subplano) out.subplano = FALLBACK_SUB;

    return out;
  } catch (err) {
    console.error("Erro em lerImagem:", err && err.message);
    // mantém seu contrato atual (o endpoint devolve isso em text)
    return {plano: "plano não identificado",
      subplano: "subplano não identificado"};
  }
}


exports.leitorImagem = functions.https.onRequest(async (req, res) => {
  console.log("Entrou leitorImagem");
  console.log("req.body:", JSON.stringify(req.body));

  if (req.method !== "POST") {
    res.set("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const msg = req.body || {};

  let imageUrl = null;
  if (msg.imageUrl) imageUrl = msg.imageUrl;
  else if (msg.image && msg.image.imageUrl) imageUrl = msg.image.imageUrl;
  else if (msg.image && msg.image.url) imageUrl = msg.image.url;
  else if (msg.url) imageUrl = msg.url;

  if (!imageUrl) {
    console.log("Payload inválido: faltando imageUrl");
    return res.status(400)
        .json({error: "Payload inválido: faltando imageUrl"});
  }

  if (!openai) {
    console.error("OPENAI_API_KEY não configurada.");
    return res.status(500).json({error: "OPENAI_API_KEY não configurada"});
  }

  const resultado = await lerImagem(imageUrl, msg);

  console.log("Texto lido em leitorImagem:", JSON.stringify(resultado));

  // Mantendo seu contrato atual: devolve no campo text
  return res.json({
    idMessage: msg.idMessage,
    type: msg.type,
    text: resultado, // { plano, subplano }
  });

  // Se preferir retornar direto {plano, subplano}, troque por:
  // return res.json(resultado);
});

// =============================================================
//  ================ LEITURA DE PEDIDOS MEDICOS ================
// =============================================================

/**
 * @async
 * @function lerReceituario
 * @param {string} imageUrl URL pública da imagem enviada no WhatsApp
 * @return {Promise<{
 * exames: Array<{nome:string, olho:string}>, indicacao: string}>}
 */
async function lerReceituario(imageUrl) {
  console.log("Entrou lerReceituario");

  console.log("imageUrl:", imageUrl);

  try {
    // const systemPrompt =
    // "Você é um assistente especializado em extração de dados " +
    // "de pedidos/receituários médicos oftalmológicos. " +
    // "Sua principal e única tarefa é EXTRAIR APENAS os " +
    // "EXAMES OFTALMOLÓGICOS " +
    // "solicitados e a INDICAÇÃO clínica (Justificativa).\n\n" +

    // "## REGRAS DE EXTRAÇÃO DE EXAMES:\n" +
    // "1. **Extração Seletiva (CHECKLIST):** Extraia e inclua na " +
    // "lista final APENAS os exames que possuem uma MARCAÇÃO VISÍVEL E " +
    // "INEQUÍVOCA (X, ✔, ✓, círculo, rabisco, etc.) no respectivo " +
    // "checkbox ou coluna de olho. **IGNORE** qualquer item de " +
    // "checklist que não esteja marcado.\n" +
    // "2. **Exames Manuscritos:** Exames escritos à mão (fora do checklist) " +
    // "devem ser incluídos.\n" +
    // "3. **Lateralidade (Olho):** Determine o campo 'olho' como " +
    // "'Direito', 'Esquerdo', 'Ambos' (AO, OD e OE marcados), " +
    // "ou 'Não especificado'.\n\n" +

    // "## INDICAÇÃO E FILTROS:\n" +
    // "4. **Indicação (Justificativa):** Extraia o texto da indicação " +
    // "clínica (caligrafia inclusa). Se o texto for 'Glaucoma' " +
    // "ou 'Maculopatia', extraia-o.\n" +
    // "5. **Exclusão de Ruído:** IGNORE nome do paciente, datas, " +
    // "CRM, carimbo, endereços, telefones e quaisquer palavras/linhas " +
    // "que não sejam exames ou a indicação clínica.\n\n" +

    // "## FORMATO DE SAÍDA (Obrigatório):\n" +
    // "RESPOSTA: Retorne APENAS um objeto JSON no formato estrito: " +
    // "{ exames: [ { nome:'Nome do Exame', olho:'OD/OE/AO/Não " +
    // "especificado' } ], indicacao:'...' }.\n" +
    // "Use 'Exame Ilegível' e 'Indicação não identificada'" +
    // "se a informação não for encontrada.";

    const systemPrompt =
    "Você é um assistente especializado em extração de dados " +
    "de pedidos/receituários médicos oftalmológicos. " +
    "Sua principal e única tarefa é EXTRAIR APENAS os " +
    "EXAMES OFTALMOLÓGICOS " +
    "solicitados e a INDICAÇÃO clínica (Justificativa).\n\n" +

    "## REGRAS DE EXTRAÇÃO DE EXAMES:\n" +
    "1. **Extração Seletiva (CHECKLIST):** Extraia e inclua na " +
    "lista final APENAS os exames que possuem uma MARCAÇÃO VISÍVEL E " +
    "INEQUÍVOCA (X, ✔, ✓, círculo, rabisco, etc.) no respectivo " +
    "checkbox ou coluna de olho. **PROIBIDO INFERIR:** Não inclua " +
    "variações de exames de mesmo nome (ex: variantes de OCT ou " +
    "Campo Visual) se não estiverem individualmente marcadas.\n" +
    "2. **Exames Manuscritos:** Exames escritos à mão (fora do checklist) " +
    "devem ser incluídos se forem legíveis.\n" +
    "3. **Lateralidade (Olho):** Determine o campo 'olho' como " +
    "'Direito', 'Esquerdo', 'Ambos' (AO, OD e OE marcados), " +
    "ou **'não informado'**.\n\n" +

    "## INDICAÇÃO E FILTROS:\n" +
    "4. **Indicação (Justificativa):** Extraia o texto completo da indicação " +
    "clínica (caligrafia inclusa). Não filtre o conteúdo.\n" +
    "5. **Exclusão de Ruído:** IGNORE nome do paciente, datas, " +
    "CRM, carimbo, endereços, telefones e quaisquer palavras/linhas " +
    "que não sejam exames ou a indicação clínica.\n\n" +

    "## FORMATO DE SAÍDA (Obrigatório):\n" +
    "RESPOSTA: Retorne APENAS um objeto JSON no formato estrito: " +
    "{ exames: [ { nome:'Nome do Exame', olho:'Ambos/Direito/Esquerdo/" +
    "não informado' } ], indicacao:'...' }.\n" +
    "Use 'Exame Ilegível' e 'Indicação não identificada'" +
    "se a informação não for encontrada.";

    // JSON Schema:
    const schema = {
      type: "object",
      properties: {
        exames: {
          type: "array",
          items: {
            type: "object",
            properties: {
              nome: {type: "string"},
              olho: {
                type: "string",
                // ALINHAMENTO do termo de lateralidade ao prompt
                description: "Direito | Esquerdo | Ambos | não informado",
              },
            },
            required: ["nome", "olho"],
            additionalProperties: false,
          },
        },
        indicacao: {type: "string"},
      },
      required: ["exames", "indicacao"],
      additionalProperties: false,
    };

    // Chamada à Responses API (visão) com schema via text.format
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      temperature: 0,
      top_p: 1,
      text: {
        format: {
          type: "json_schema",
          name: "ExamesOftalmoComIndicacao",
          strict: true,
          schema: schema,
        },
      },
      input: [
        {
          role: "system",
          content: [{type: "input_text", text: systemPrompt}],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Extraia os exames e a indicação clínica. " +
              "Retorne somente o JSON pedido.",
            },
            {
              type: "input_image", image_url: imageUrl,
            },
          ],
        },
      ],
    });

    // Extrai o JSON da saída
    let jsonText = "";
    if (response && response.output && response.output.length > 0) {
      const content = response.output[0].content;
      if (content && content.length > 0 && content[0].type === "output_text") {
        jsonText = content[0].text;
      }
    }

    let out = null;
    try {
      out = JSON.parse(jsonText);
    } catch (e) {
      console.log("Erro ao parsear JSON: " + (e));
    }

    // Fallbacks + filtro de checklist
    if (!out || !Array.isArray(out.exames)) {
      out = {exames: [], indicacao: ""};
    }

    // NOVO CONSOLE LOG DE DEBUG:
    console.log("JSON BRUTO DA API:", jsonText);

    return out;
    //
  } catch (err) {
    console.error("Erro em lerReceituario:", err && err.message);
    return {
      exames: [
        {nome: "não foi possivel identificar exames", olho: "não informado"},
      ],
      indicacao: "não foi possivel identificar indicação",
    };
  }
}


exports.ChamarLerimagemReceituario = functions.https
    .onRequest(async (req, res) => {
      console.log("Entrou imagemReceituario");
      console.log("req.body:", JSON.stringify(req.body));

      if (req.method !== "POST") {
        res.set("Allow", "POST");
        return res.status(405).send("Method Not Allowed");
      }

      const msg = req.body || {};

      let imageUrl = null;
      if (msg.imageUrl) imageUrl = msg.imageUrl;
      else if (msg.image && msg.image.imageUrl) imageUrl = msg.image.imageUrl;
      else if (msg.image && msg.image.url) imageUrl = msg.image.url;
      else if (msg.url) imageUrl = msg.url;

      if (!imageUrl) {
        console.log("Payload inválido: faltando imageUrl");
        return res.status(400)
            .json({error: "Payload inválido: faltando imageUrl"});
      }

      if (!openai) {
        console.error("OPENAI_API_KEY não configurada.");
        return res.status(500)
            .json({error: "OPENAI_API_KEY não configurada"});
      }

      const resultado = await lerReceituario(imageUrl);

      console.log("JSON RESULTADO:", JSON.stringify(resultado));

      // Mantendo seu contrato: retorno em `text`
      return res.json({
        idMessage: msg.idMessage,
        type: msg.type,
        text: resultado,
      });
    });
