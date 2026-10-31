// functions/api/admin-colegas.js — Cloudflare Pages Function con D1
// Gestión de Planilla de Difusión y Encuesta a Colegas del grupo WhatsApp UACh

const COLEGAS_INICIALES = [
  {
    "fono": "+56999312544",
    "nombre_real": "",
    "alias_whatsapp": "Daniel 🐼"
  },
  {
    "fono": "+56984565699",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56973223287",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56979475962",
    "nombre_real": "",
    "alias_whatsapp": "Yasna Contreras U."
  },
  {
    "fono": "+56941680063",
    "nombre_real": "",
    "alias_whatsapp": "Aurelio"
  },
  {
    "fono": "+56999720087",
    "nombre_real": "",
    "alias_whatsapp": "~Marce"
  },
  {
    "fono": "+56957390525",
    "nombre_real": "",
    "alias_whatsapp": "fabiola arias"
  },
  {
    "fono": "+56975149338",
    "nombre_real": "",
    "alias_whatsapp": "Felipe Gacitúa"
  },
  {
    "fono": "+56975170760",
    "nombre_real": "",
    "alias_whatsapp": "Felipe"
  },
  {
    "fono": "+56973778482",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56942596048",
    "nombre_real": "",
    "alias_whatsapp": "Felipe Gallardo"
  },
  {
    "fono": "+56973619726",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56999288464",
    "nombre_real": "",
    "alias_whatsapp": "Jeremias Nahuelpán"
  },
  {
    "fono": "+56974640259",
    "nombre_real": "Directora Fabiola",
    "alias_whatsapp": "Fabiola Ojeda"
  },
  {
    "fono": "+56984337355",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56990749857",
    "nombre_real": "",
    "alias_whatsapp": "Felipe Andres"
  },
  {
    "fono": "+56989596578",
    "nombre_real": "",
    "alias_whatsapp": "Carlos"
  },
  {
    "fono": "+56955233090",
    "nombre_real": "",
    "alias_whatsapp": "AFRamirez🏀"
  },
  {
    "fono": "+56994591864",
    "nombre_real": "",
    "alias_whatsapp": "Angel M."
  },
  {
    "fono": "+56977658755",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56926269594",
    "nombre_real": "",
    "alias_whatsapp": "David"
  },
  {
    "fono": "+56933817736",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56997120665",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56967890282",
    "nombre_real": "",
    "alias_whatsapp": "Felipe Canet"
  },
  {
    "fono": "+56962270670",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56965332066",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56996297557",
    "nombre_real": "",
    "alias_whatsapp": "Carolina valdebenito"
  },
  {
    "fono": "+56951677967",
    "nombre_real": "",
    "alias_whatsapp": "Valentina"
  },
  {
    "fono": "+56920081261",
    "nombre_real": "",
    "alias_whatsapp": "Francisco Lagos S"
  },
  {
    "fono": "+56963318063",
    "nombre_real": "",
    "alias_whatsapp": "Sebastian Rochow"
  },
  {
    "fono": "+56944446592",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56971369263",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56987554016",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56997740503",
    "nombre_real": "",
    "alias_whatsapp": "Franco Caiozzi"
  },
  {
    "fono": "+56999664271",
    "nombre_real": "",
    "alias_whatsapp": "Andy"
  },
  {
    "fono": "+56988784899",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56985303787",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56975939211",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56965127407",
    "nombre_real": "",
    "alias_whatsapp": "Mauricio Reyes"
  },
  {
    "fono": "+56993759808",
    "nombre_real": "",
    "alias_whatsapp": "Safka"
  },
  {
    "fono": "+56990049492",
    "nombre_real": "",
    "alias_whatsapp": "DiegoG"
  },
  {
    "fono": "+56957448323",
    "nombre_real": "",
    "alias_whatsapp": "Yose"
  },
  {
    "fono": "+56977891695",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56944257156",
    "nombre_real": "",
    "alias_whatsapp": "🤵🏽"
  },
  {
    "fono": "+56992423352",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56933201178",
    "nombre_real": "",
    "alias_whatsapp": "Anto"
  },
  {
    "fono": "+56975562956",
    "nombre_real": "",
    "alias_whatsapp": "Natalia Espiñeira"
  },
  {
    "fono": "+56967026539",
    "nombre_real": "",
    "alias_whatsapp": "Joaquín Alonso"
  },
  {
    "fono": "+56953938975",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56945256648",
    "nombre_real": "",
    "alias_whatsapp": "Karina"
  },
  {
    "fono": "+56982546051",
    "nombre_real": "",
    "alias_whatsapp": "Felipe"
  },
  {
    "fono": "+56995038252",
    "nombre_real": "",
    "alias_whatsapp": "Karlita"
  },
  {
    "fono": "+56950165405",
    "nombre_real": "",
    "alias_whatsapp": "Camila"
  },
  {
    "fono": "+56987371680",
    "nombre_real": "",
    "alias_whatsapp": "🐶"
  },
  {
    "fono": "+56983918592",
    "nombre_real": "",
    "alias_whatsapp": "Juanpa"
  },
  {
    "fono": "+56975263516",
    "nombre_real": "",
    "alias_whatsapp": "Jv 🌿🪷"
  },
  {
    "fono": "+56988468928",
    "nombre_real": "",
    "alias_whatsapp": "Rodrigo"
  },
  {
    "fono": "+56993543087",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56998551034",
    "nombre_real": "",
    "alias_whatsapp": "Tomas"
  },
  {
    "fono": "+56998021834",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56976688433",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56948730077",
    "nombre_real": "",
    "alias_whatsapp": "Daniel Miranda"
  },
  {
    "fono": "+56974262273",
    "nombre_real": "",
    "alias_whatsapp": "Guiilermo Muñoz"
  },
  {
    "fono": "+56976907476",
    "nombre_real": "",
    "alias_whatsapp": "Cristian Vega"
  },
  {
    "fono": "+56989418650",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56985782669",
    "nombre_real": "",
    "alias_whatsapp": "GDM"
  },
  {
    "fono": "+56991926306",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56989046353",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56966552707",
    "nombre_real": "",
    "alias_whatsapp": "Daniel"
  },
  {
    "fono": "+56932168258",
    "nombre_real": "",
    "alias_whatsapp": "Felipe Leiva"
  },
  {
    "fono": "+56959255264",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56956766406",
    "nombre_real": "",
    "alias_whatsapp": "Carlos"
  },
  {
    "fono": "+56957593999",
    "nombre_real": "",
    "alias_whatsapp": "Pao🤘🏻"
  },
  {
    "fono": "+56977578253",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56956460124",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56982569712",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56948594115",
    "nombre_real": "",
    "alias_whatsapp": "Lore"
  },
  {
    "fono": "+56976367047",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56999897537",
    "nombre_real": "",
    "alias_whatsapp": "M"
  },
  {
    "fono": "+56942184346",
    "nombre_real": "",
    "alias_whatsapp": "Miguel Angel"
  },
  {
    "fono": "+56982548491",
    "nombre_real": "",
    "alias_whatsapp": "Cristofer"
  },
  {
    "fono": "+56949895890",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56982279848",
    "nombre_real": "Nacho",
    "alias_whatsapp": "Nacho"
  },
  {
    "fono": "+56941611674",
    "nombre_real": "",
    "alias_whatsapp": "Pili🍃"
  },
  {
    "fono": "+56984099854",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56992929561",
    "nombre_real": "",
    "alias_whatsapp": "Daniela Serón"
  },
  {
    "fono": "+56998688603",
    "nombre_real": "",
    "alias_whatsapp": "Nicole❤️"
  },
  {
    "fono": "+56971581673",
    "nombre_real": "",
    "alias_whatsapp": "Duvan Olivares"
  },
  {
    "fono": "+56950542292",
    "nombre_real": "",
    "alias_whatsapp": "Adrian"
  },
  {
    "fono": "+56991789094",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56941384767",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56965888532",
    "nombre_real": "",
    "alias_whatsapp": "Claudio D"
  },
  {
    "fono": "+56984149465",
    "nombre_real": "",
    "alias_whatsapp": "BM"
  },
  {
    "fono": "+56966693663",
    "nombre_real": "",
    "alias_whatsapp": "Daniel Rosas"
  },
  {
    "fono": "+56987902706",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56988095283",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56985956694",
    "nombre_real": "",
    "alias_whatsapp": "Marcelo Riffo"
  },
  {
    "fono": "+56972345320",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56933761051",
    "nombre_real": "",
    "alias_whatsapp": "Felipe Roldan"
  },
  {
    "fono": "+56990520565",
    "nombre_real": "",
    "alias_whatsapp": "Yona😜"
  },
  {
    "fono": "+56953631464",
    "nombre_real": "",
    "alias_whatsapp": "Natalia"
  },
  {
    "fono": "+56942855465",
    "nombre_real": "",
    "alias_whatsapp": "Benja Muñoz"
  },
  {
    "fono": "+56995154023",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56947731643",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56945630807",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56996731876",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56985643279",
    "nombre_real": "",
    "alias_whatsapp": "victorjg1985"
  },
  {
    "fono": "+56982087472",
    "nombre_real": "",
    "alias_whatsapp": "Tamara Fuentealba R 🪸"
  },
  {
    "fono": "+56990933121",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56977944977",
    "nombre_real": "",
    "alias_whatsapp": "Solis"
  },
  {
    "fono": "+56952388762",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56992797596",
    "nombre_real": "",
    "alias_whatsapp": "Pato"
  },
  {
    "fono": "+56985645286",
    "nombre_real": "",
    "alias_whatsapp": "Benjamin Ramirez Loyola"
  },
  {
    "fono": "+56942575938",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56997748650",
    "nombre_real": "",
    "alias_whatsapp": "Sebastian Huenchulaf"
  },
  {
    "fono": "+56944601198",
    "nombre_real": "",
    "alias_whatsapp": "💙"
  },
  {
    "fono": "+56985173033",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56996433290",
    "nombre_real": "",
    "alias_whatsapp": "Jorge Garnica"
  },
  {
    "fono": "+56961865315",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56984028686",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56965917824",
    "nombre_real": "",
    "alias_whatsapp": "Isidora 🌸"
  },
  {
    "fono": "+56968450720",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56946162186",
    "nombre_real": "",
    "alias_whatsapp": "Andres"
  },
  {
    "fono": "+56966288842",
    "nombre_real": "",
    "alias_whatsapp": "Fabian C"
  },
  {
    "fono": "+56953849538",
    "nombre_real": "",
    "alias_whatsapp": "Dylan Zambrano"
  },
  {
    "fono": "+56962498606",
    "nombre_real": "",
    "alias_whatsapp": "Mauricio Gallardo"
  },
  {
    "fono": "+56992919121",
    "nombre_real": "",
    "alias_whatsapp": "Jorge Isai 🧢"
  },
  {
    "fono": "+56982495424",
    "nombre_real": "",
    "alias_whatsapp": "Billy Hunter"
  },
  {
    "fono": "+56934139883",
    "nombre_real": "",
    "alias_whatsapp": "Nicolas Rios"
  },
  {
    "fono": "+56958968345",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56961406775",
    "nombre_real": "",
    "alias_whatsapp": "Oscar Aravena Traipi"
  },
  {
    "fono": "+56984235246",
    "nombre_real": "",
    "alias_whatsapp": "Alexander"
  },
  {
    "fono": "+56979672481",
    "nombre_real": "",
    "alias_whatsapp": "Eduardo Subiabre"
  },
  {
    "fono": "+56987205026",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56942344202",
    "nombre_real": "",
    "alias_whatsapp": "Erick Vega Palma"
  },
  {
    "fono": "+56984379885",
    "nombre_real": "",
    "alias_whatsapp": "IGNACIO CASTILLO"
  },
  {
    "fono": "+56994276505",
    "nombre_real": "",
    "alias_whatsapp": "~S~♤"
  },
  {
    "fono": "+56951986709",
    "nombre_real": "",
    "alias_whatsapp": "Jorge Hübner"
  },
  {
    "fono": "+56961119797",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56940561909",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56971897381",
    "nombre_real": "",
    "alias_whatsapp": "Felipe Mansilla"
  },
  {
    "fono": "+56944740880",
    "nombre_real": "",
    "alias_whatsapp": "Jaime Vergara"
  },
  {
    "fono": "+56967432160",
    "nombre_real": "",
    "alias_whatsapp": "CBustamante"
  },
  {
    "fono": "+56952342782",
    "nombre_real": "",
    "alias_whatsapp": "Miguel Nicolas"
  },
  {
    "fono": "+56956362748",
    "nombre_real": "",
    "alias_whatsapp": "Deysi🌼"
  },
  {
    "fono": "+56964599475",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56962672559",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56940521195",
    "nombre_real": "",
    "alias_whatsapp": "Daniel Jara"
  },
  {
    "fono": "+56948494406",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56982484563",
    "nombre_real": "",
    "alias_whatsapp": "Rodrigo"
  },
  {
    "fono": "+56946183994",
    "nombre_real": "",
    "alias_whatsapp": "Patt."
  },
  {
    "fono": "+56947511750",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56996951003",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56992084123",
    "nombre_real": "",
    "alias_whatsapp": "Javier Castillo"
  },
  {
    "fono": "+56945279226",
    "nombre_real": "",
    "alias_whatsapp": "Camilo"
  },
  {
    "fono": "+61401093870",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56993201249",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56952245314",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56975577838",
    "nombre_real": "",
    "alias_whatsapp": "Matias Moenne-loccoz"
  },
  {
    "fono": "+56976457038",
    "nombre_real": "",
    "alias_whatsapp": "Vivi"
  },
  {
    "fono": "+56981703766",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56955233211",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56987361159",
    "nombre_real": "",
    "alias_whatsapp": "Sebastian Chiguay Z"
  },
  {
    "fono": "+56989779177",
    "nombre_real": "",
    "alias_whatsapp": "Pato Abello"
  },
  {
    "fono": "+56988156596",
    "nombre_real": "",
    "alias_whatsapp": "Francisco"
  },
  {
    "fono": "+56989362997",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56988304474",
    "nombre_real": "",
    "alias_whatsapp": "Belén Angela"
  },
  {
    "fono": "+56934962482",
    "nombre_real": "",
    "alias_whatsapp": "Benjamín Navarro M."
  },
  {
    "fono": "+56967026340",
    "nombre_real": "",
    "alias_whatsapp": "Ignacio"
  },
  {
    "fono": "+56982423416",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56983067661",
    "nombre_real": "",
    "alias_whatsapp": "Rafael Núñez"
  },
  {
    "fono": "+56976170357",
    "nombre_real": "",
    "alias_whatsapp": "carlos sanz castro"
  },
  {
    "fono": "+56957205588",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56972624556",
    "nombre_real": "",
    "alias_whatsapp": "🪐📸"
  },
  {
    "fono": "+56963329709",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56986118873",
    "nombre_real": "",
    "alias_whatsapp": "Maicol"
  },
  {
    "fono": "+56973414222",
    "nombre_real": "",
    "alias_whatsapp": "Jorge"
  },
  {
    "fono": "+56934260376",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56932977548",
    "nombre_real": "",
    "alias_whatsapp": "Rodrigo"
  },
  {
    "fono": "+56941313773",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56971086778",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56994618572",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56957351690",
    "nombre_real": "",
    "alias_whatsapp": "Scheryl 🌸"
  },
  {
    "fono": "+56938673417",
    "nombre_real": "",
    "alias_whatsapp": "Cata Rodriguez"
  },
  {
    "fono": "+56982650319",
    "nombre_real": "",
    "alias_whatsapp": "PHR"
  },
  {
    "fono": "+56945526333",
    "nombre_real": "",
    "alias_whatsapp": "Felipe M."
  },
  {
    "fono": "+56967234536",
    "nombre_real": "",
    "alias_whatsapp": "Roberto M"
  },
  {
    "fono": "+56974516592",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56956713455",
    "nombre_real": "",
    "alias_whatsapp": "Aukan"
  },
  {
    "fono": "+56965877974",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56982985651",
    "nombre_real": "",
    "alias_whatsapp": "Felipe Andrés Mora"
  },
  {
    "fono": "+56986173001",
    "nombre_real": "",
    "alias_whatsapp": "Nicol Conejeros"
  },
  {
    "fono": "+56946322061",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56987695011",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56981616722",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56982520909",
    "nombre_real": "",
    "alias_whatsapp": "Camila"
  },
  {
    "fono": "+56981588887",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56931242265",
    "nombre_real": "",
    "alias_whatsapp": "gabrielmurtschwa"
  },
  {
    "fono": "+56972470809",
    "nombre_real": "",
    "alias_whatsapp": "Vale ✨"
  },
  {
    "fono": "+56956549029",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56979643324",
    "nombre_real": "",
    "alias_whatsapp": "Javier"
  },
  {
    "fono": "+56942053843",
    "nombre_real": "",
    "alias_whatsapp": "Emilek"
  },
  {
    "fono": "+56984689069",
    "nombre_real": "",
    "alias_whatsapp": "Esteban"
  },
  {
    "fono": "+56920810592",
    "nombre_real": "",
    "alias_whatsapp": "📝"
  },
  {
    "fono": "+56942955536",
    "nombre_real": "",
    "alias_whatsapp": "."
  },
  {
    "fono": "+56947701307",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56991673959",
    "nombre_real": "",
    "alias_whatsapp": "Felipe 🪐☄️👨🏻‍🚀👃🏼💫"
  },
  {
    "fono": "+56995567893",
    "nombre_real": "",
    "alias_whatsapp": "Esteban"
  },
  {
    "fono": "+56962378533",
    "nombre_real": "",
    "alias_whatsapp": "Anii 🥳"
  },
  {
    "fono": "+56978919291",
    "nombre_real": "",
    "alias_whatsapp": "Escuela Construcción"
  },
  {
    "fono": "+56940128521",
    "nombre_real": "",
    "alias_whatsapp": "Ignacio"
  },
  {
    "fono": "+56975257585",
    "nombre_real": "",
    "alias_whatsapp": "Coni 🪐"
  },
  {
    "fono": "+56973991882",
    "nombre_real": "",
    "alias_whatsapp": "~Carlos"
  },
  {
    "fono": "+13683996904",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56975218642",
    "nombre_real": "",
    "alias_whatsapp": "Fernando"
  },
  {
    "fono": "+56974308245",
    "nombre_real": "",
    "alias_whatsapp": "Victor Rojas"
  },
  {
    "fono": "+56985111527",
    "nombre_real": "",
    "alias_whatsapp": "Rodrigo"
  },
  {
    "fono": "+56945161664",
    "nombre_real": "",
    "alias_whatsapp": "🥁"
  },
  {
    "fono": "+56982947238",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56972220032",
    "nombre_real": "",
    "alias_whatsapp": "Francisca Saldivia A."
  },
  {
    "fono": "+56976592046",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56977111044",
    "nombre_real": "",
    "alias_whatsapp": "Tamara Fuentealba"
  },
  {
    "fono": "+56977490660",
    "nombre_real": "",
    "alias_whatsapp": "Sebastián De La Fuente"
  },
  {
    "fono": "+56967867686",
    "nombre_real": "",
    "alias_whatsapp": "Luis Vera"
  },
  {
    "fono": "+56934681863",
    "nombre_real": "",
    "alias_whatsapp": "del sur constructores"
  },
  {
    "fono": "+56978148959",
    "nombre_real": "",
    "alias_whatsapp": "Marc Codjambassis"
  },
  {
    "fono": "+56971435795",
    "nombre_real": "",
    "alias_whatsapp": "Francisco"
  },
  {
    "fono": "+56974257440",
    "nombre_real": "",
    "alias_whatsapp": "Rodrigo Leal Zuñiga"
  },
  {
    "fono": "+56971813162",
    "nombre_real": "",
    "alias_whatsapp": "Angela"
  },
  {
    "fono": "+56973239139",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56967887100",
    "nombre_real": "",
    "alias_whatsapp": "Matias"
  },
  {
    "fono": "+56977031288",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56993977934",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56941236532",
    "nombre_real": "",
    "alias_whatsapp": "Javi Mardones"
  },
  {
    "fono": "+56923785575",
    "nombre_real": "",
    "alias_whatsapp": "Claudio Diaz"
  },
  {
    "fono": "+56972750004",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56992828330",
    "nombre_real": "",
    "alias_whatsapp": "Gonzalo"
  },
  {
    "fono": "+56956268142",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56973826526",
    "nombre_real": "",
    "alias_whatsapp": "Alvaro Lagos"
  },
  {
    "fono": "+56990030316",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56971560642",
    "nombre_real": "",
    "alias_whatsapp": "Matias Vega"
  },
  {
    "fono": "+56985427750",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56996339132",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56990974791",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56945922165",
    "nombre_real": "",
    "alias_whatsapp": "Felipe Chavez"
  },
  {
    "fono": "+56937651676",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56984906813",
    "nombre_real": "",
    "alias_whatsapp": "Marcela Verónica ☺️"
  },
  {
    "fono": "+56930033010",
    "nombre_real": "",
    "alias_whatsapp": "José"
  },
  {
    "fono": "+56998524317",
    "nombre_real": "",
    "alias_whatsapp": "Axa"
  },
  {
    "fono": "+56976618114",
    "nombre_real": "",
    "alias_whatsapp": "Matias Carrasco"
  },
  {
    "fono": "+56933275310",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56984198657",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56956623925",
    "nombre_real": "",
    "alias_whatsapp": "Paula"
  },
  {
    "fono": "+56978475155",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56945526334",
    "nombre_real": "",
    "alias_whatsapp": "Nicolas Barria"
  },
  {
    "fono": "+56936427523",
    "nombre_real": "",
    "alias_whatsapp": "Yesenia ✨"
  },
  {
    "fono": "+56979962767",
    "nombre_real": "",
    "alias_whatsapp": "Mauricio Kesternich"
  },
  {
    "fono": "+56982137875",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56994016309",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56957084144",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56958012172",
    "nombre_real": "",
    "alias_whatsapp": "Isi🦥"
  },
  {
    "fono": "+56984960376",
    "nombre_real": "",
    "alias_whatsapp": "Yonatan Beltrán"
  },
  {
    "fono": "+56992225931",
    "nombre_real": "",
    "alias_whatsapp": "Constanza Garrido A."
  },
  {
    "fono": "+56974230056",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56932392393",
    "nombre_real": "",
    "alias_whatsapp": "Ignacio"
  },
  {
    "fono": "+56984519417",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56991516843",
    "nombre_real": "",
    "alias_whatsapp": "ESTEBAN"
  },
  {
    "fono": "+56976063928",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56983722905",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56972197693",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56993110003",
    "nombre_real": "",
    "alias_whatsapp": ".."
  },
  {
    "fono": "+56957560681",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56995788069",
    "nombre_real": "",
    "alias_whatsapp": "Camila Ignacia"
  },
  {
    "fono": "+56978130446",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56990000490",
    "nombre_real": "",
    "alias_whatsapp": "Sebastián Parra"
  },
  {
    "fono": "+56991047623",
    "nombre_real": "",
    "alias_whatsapp": "Byron FA."
  },
  {
    "fono": "+34665008354",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+61413480010",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56975736676",
    "nombre_real": "",
    "alias_whatsapp": "Evelyn Meza"
  },
  {
    "fono": "+56997553173",
    "nombre_real": "",
    "alias_whatsapp": "Yesmi"
  },
  {
    "fono": "+56987966066",
    "nombre_real": "",
    "alias_whatsapp": "Carolina Zuñiga"
  },
  {
    "fono": "+56984243309",
    "nombre_real": "",
    "alias_whatsapp": ""
  },
  {
    "fono": "+56973974172",
    "nombre_real": "",
    "alias_whatsapp": "Valentina Gutiérrez K"
  },
  {
    "fono": "+56995725887",
    "nombre_real": "",
    "alias_whatsapp": "Daniel"
  },
  {
    "fono": "+56942460892",
    "nombre_real": "",
    "alias_whatsapp": ""
  }
];

async function crearAdminToken(password) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const firma = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("grupo-uach-admin-session")
  );
  return Array.from(new Uint8Array(firma))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function asegurarTablaYSeed(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS colegas_grupo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fono TEXT UNIQUE NOT NULL,
      nombre_real TEXT DEFAULT '',
      alias_whatsapp TEXT DEFAULT '',
      conocia_app TEXT DEFAULT '',
      opinion_mejora TEXT DEFAULT '',
      mensaje_enviado INTEGER DEFAULT 0,
      fecha_envio TEXT DEFAULT '',
      fecha_respuesta TEXT DEFAULT ''
    )
  `).run();

  const countRow = await db.prepare("SELECT COUNT(*) AS cnt FROM colegas_grupo").first();
  const total = Number(countRow?.cnt || 0);
  if (total === 0 && COLEGAS_INICIALES.length > 0) {
    const stmts = COLEGAS_INICIALES.map(c =>
      db.prepare(
        "INSERT OR IGNORE INTO colegas_grupo (fono, nombre_real, alias_whatsapp) VALUES (?, ?, ?)"
      ).bind(c.fono, c.nombre_real || '', c.alias_whatsapp || '')
    );
    // D1 batch admite lotes grandes; dividimos en bloques de 80 por seguridad
    for (let i = 0; i < stmts.length; i += 80) {
      await db.batch(stmts.slice(i, i + 80));
    }
  }
}

function fechaHoyChile() {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
}

export async function onRequestGet({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const adminPassword = env.ADMIN_PASSWORD || "jems2026";
    const auth = request.headers.get("Authorization") || "";
    const tokenEsperado = await crearAdminToken(adminPassword);

    if (auth !== `Bearer ${tokenEsperado}`) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    await asegurarTablaYSeed(env.DB);

    const res = await env.DB.prepare(`
      SELECT id, fono, nombre_real, alias_whatsapp, conocia_app, opinion_mejora,
             COALESCE(mensaje_enviado, 0) AS mensaje_enviado,
             fecha_envio, fecha_respuesta
      FROM colegas_grupo
      ORDER BY mensaje_enviado ASC, id ASC
    `).all();

    return Response.json({
      ok: true,
      colegas: res.results || []
    }, { status: 200 });
  } catch (err) {
    return Response.json({ error: "Error cargando colegas", detail: err.message }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const adminPassword = env.ADMIN_PASSWORD || "jems2026";
    const auth = request.headers.get("Authorization") || "";
    const tokenEsperado = await crearAdminToken(adminPassword);

    if (auth !== `Bearer ${tokenEsperado}`) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    await asegurarTablaYSeed(env.DB);

    const body = await request.json().catch(() => ({}));
    const accion = String(body.accion || '').trim();

    if (accion === 'marcar_enviado') {
      const id = Number(body.id);
      if (!id) return Response.json({ error: "Falta ID del colega" }, { status: 400 });
      const enviado = body.enviado !== undefined ? (body.enviado ? 1 : 0) : 1;
      const fecha = enviado ? fechaHoyChile() : '';
      await env.DB.prepare(
        "UPDATE colegas_grupo SET mensaje_enviado = ?, fecha_envio = ? WHERE id = ?"
      ).bind(enviado, fecha, id).run();
      return Response.json({ ok: true, id, mensaje_enviado: enviado, fecha_envio: fecha }, { status: 200 });
    }

    if (accion === 'guardar_encuesta') {
      const id = Number(body.id);
      if (!id) return Response.json({ error: "Falta ID del colega" }, { status: 400 });
      const nombre_real = String(body.nombre_real ?? '').trim();
      const conocia_app = String(body.conocia_app ?? '').trim();
      const opinion_mejora = String(body.opinion_mejora ?? '').trim();
      const fecha_resp = (conocia_app || opinion_mejora) ? fechaHoyChile() : '';

      await env.DB.prepare(`
        UPDATE colegas_grupo
        SET nombre_real = ?, conocia_app = ?, opinion_mejora = ?, fecha_respuesta = ?
        WHERE id = ?
      `).bind(nombre_real, conocia_app, opinion_mejora, fecha_resp, id).run();

      return Response.json({
        ok: true,
        id,
        nombre_real,
        conocia_app,
        opinion_mejora,
        fecha_respuesta: fecha_resp
      }, { status: 200 });
    }

    if (accion === 'agregar_colega') {
      const digits = String(body.fono || '').replace(/\D/g, '');
      if (digits.length < 8) {
        return Response.json({ error: "Número de teléfono inválido" }, { status: 400 });
      }
      const fono = '+' + digits;
      const nombre_real = String(body.nombre_real || '').trim();
      const alias_whatsapp = String(body.alias_whatsapp || '').trim();
      await env.DB.prepare(
        "INSERT OR IGNORE INTO colegas_grupo (fono, nombre_real, alias_whatsapp) VALUES (?, ?, ?)"
      ).bind(fono, nombre_real, alias_whatsapp).run();
      return Response.json({ ok: true, fono }, { status: 200 });
    }

    return Response.json({ error: "Acción no válida" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: "Error procesando solicitud", detail: err.message }, { status: 500 });
  }
}
