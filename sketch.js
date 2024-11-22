//dichiaro le variabili globali
let table; 
//object --> w3school: Objects are variables too. But objects can contain many values. It is a common practice to declare objects with the const keyword. name:value pairs are also called key:value pairs.
const continents = {}; 
//quando si confronteranno le length dei fiumi, 0 sarà sicuramente < a qualsiasi lunghezza --> max(maxLength, length) il primo valore della lunghezza sostituirà il valore iniziale 0
let maxLength = 0;
//utile per il confronto min(minLength, length) --> il primo valore della lunghezza sostituirà Infinity, e da lì in poi minLength avrà come valore il valore più piccolo passato per quanto riguarda la lunghezza 
let minLength = Infinity;
let maxTemp = 0;        
let minTemp = Infinity; 
let rotation = 0;
let coldColor;    
let hotColor;     
//array con i colori per i continenti 
let continentColors = [
  '#756B58',  //africa
  '#A3AA93',  //sud america
  '#494338',  //asia
  '#494C3D',  //nord am
  '#616150',  //australia
  '#71755D',  //europa
  '#2E3027'   //oceania
];

function preload() {
  table = loadTable('assets/data.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  //controllo che i dati siano stati caricati correttamente    
  tableObj = table.getObject();
  console.log(tableObj);
  //inizializzo i valori delle linee = fiumi
  coldColor = color("#9AB3CA");    
  hotColor = color("#C15C26"); 
  angleMode(RADIANS);
  //chiamo la funzione gestioneData passando come parametro data la table
  gestioneData(table);
}

//funzione gestioneData che serve per calcolare i valori minimi e massimi di alcuni parametri e organizzare i fiumi in base al continente di appartenenza
function gestioneData(data) {
  //ciclo for itera su ogni riga di data = table = dataset csv --> w3: The JavaScript for of statement loops through the values of an iterable object. It lets you loop over iterable data structures such as Arrays, Strings...
  for (let row of data.rows) {
    //estrae da riga corrente (in cui sta iterando) il valore presente nella colonna length e poi in avg_temp
    let length = row.getNum('length');
    let temp = row.getNum('avg_temp');
    //aggiorno i valori di maxLength, minLength, maxTemp, minTemp usando le funzioni max() e min()
    //minLength all'inizio è = Infinity --> lunghezza del primo fiume diventa il nuovo valore salvato in minLength, questo verrà confrontato con le nuove lunghezze dei fiumi e viene aggiornato se viene trovato un valore più piccolo --> alla fine del ciclo, minLength = lunghezza minima di tutti i fiumi nel dataset
    minLength = min(minLength, length);
    maxLength = max(maxLength, length);
    minTemp = min(minTemp, temp);
    maxTemp = max(maxTemp, temp);
  }

  //w3: A JavaScript Set is a collection of unique values. Each value can only occur once in a Set. The values can be of any type, primitive values or objects.You can create a JavaScript Set by: Passing an array to new Set() --> quindi Set creato per raccogliere i nomi dei continenti in modo ognuno di essi venga aggiunto solo una volta 
  let continentsSet = new Set();
  //ciclo for che itera di nuovo per tutte le righe del dataset e aggiunge il nome del continente (row.getString('continent')) al set / w3school --> Create a Set and use add() to add values
  for (let row of data.rows) {
    continentsSet.add(row.getString('continent'));
  }
  //ciclo for che itera per ogni elemento del Set
  for (let continent of continentsSet) {
    //obj continents creato globalmente e inizialmente lasciato vuoto
    //qui vongono inserite una serie di coppie key/values 
    //la chiave è continent ossia uno dei continenti del Set 
    //il valore associato ad ogni chiave per ora è una array vuota (per ora)
    continents[continent] = [];
  }

  //ciclo for che itera per tutte le righe e che recupera i valori dalle colonne desiderate dal dataset
  for (let row of data.rows) {
    let continent = row.getString('continent');
    let length = row.getNum('length');
    let name = row.getString('name');
    let temperature = row.getNum('avg_temp');
    //ora che ho recuperato i valori faccio push --> w3school: The push() method adds new items to the end of an array
    //viene riempita l'array inizialmente lasciata vuota che è il valore per ogni chiave dell'oggetto
    continents[continent].push({
      name: name,
      length: length, 
      temperature: temperature
    });
    //recap: oggetto continents che contiene i continenti come chiavi --> ogni chiave ha come valore una array di oggetti (ogni oggetto rappresenta un fiume). l'oggetto-fiume contiene tre valori ossia name, length e temperature che sono stati presi dal file csv
  }
}

function draw() {
  background("#CBD1D2");  
  //ripartizione schermo per i diversi elementi della visualizzazione 
  const titleHeight = height * 0.05;
  const legendHeight = height * 0.06;
  const sketchHeight = height - titleHeight - legendHeight;
  //funzioni per disegnare i diversi elementi della visualizzazione
  drawTitle(titleHeight);   
  drawLegend(legendHeight); 
  drawSketch(titleHeight, sketchHeight);  
}

//titolo e sottotitolo
function drawTitle(titleHeight) {
  textFont("Courier New"); 
  textAlign(CENTER, CENTER);
  let titleSize = min(height * 0.045, width *0.045); 
  textSize(titleSize); 
  fill(0);
  text('RIVERS IN THE WORLD', width / 2, titleHeight * 0.4); 
  let descriptionSize = min(height * 0.015, width * 0.015);
  textSize(descriptionSize); 
  textWrap(WORD); 
  let textWidthLimit = width * 0.95; 
  text('Find out the length of the rivers and their average temperature, interpolated between the maximum and minimum recorded',width / 2 - textWidthLimit / 2, titleHeight * 0.975, textWidthLimit);
}

//sketch principale
function drawSketch(titleHeight, sketchHeight) {  
  let diameter = min(width, sketchHeight) * 0.96;
  let radius = diameter / 2;
  translate(width / 2, titleHeight + sketchHeight / 2); 
  //valore dell'angolo di rotazione, ogni volta che viene chiamata questa riga aumenta di 0.001 rad 
  rotation += 0.001;  
  //trasformazione rotate di angolo "rotation" --> ogni volta che viene eseguita la funz draw (ad ogni frame) il valore di rotation aumenta di 0.001 rad --> la scena viene disegnata ruotandola di questo valore incrementato creando un effetto visivo di rotazione 
  rotate(rotation);   
  //fiumi tot del dataset
  let riversNumber = table.getRowCount();
  //angolo di partenza ogni settore circolare/continente. inzio è = 0 il primo settore circolare viene disegnato partendo da 0 rad, per l'iteraz. successiva il valore viene aggiornato aggiungendo l'angolo del settore circolare precedente sectorAngle (vedi in fondo alla funz)
  let startAngle = 0;
  //indice usato per assegnare un colore ad ogni continente. inizio = 0 il primo settore circ viene disegnato con il colore in posiz 0 dell'array dei colori poi aggiornato di 1 pos alla volta (vedi sotto)
  let continentIndex = 0;
  
  //disegno i settori circolari = continenti
  //ciclo che itera per tutte le chiavi dell'oggetto continents 
  for (let continent in continents) {
    //continents[continent] accede al valore associato alla chiave (di obj continents) continent e restituisce una array composta da tutti gli oggetti/fiumi che appartengono a quel continente/chiave
    let rivers = continents[continent];
    //angolo in rad che occupa ogni settore circ/continente --> rivers.length / riversNumber è proporzione tra numero di fiumi del continente corrente/tutti i fiumi del dataset
    let sectorAngle = (rivers.length / riversNumber) * TWO_PI;
    let continentColor = continentColors[continentIndex];
    fill(continentColor);
    noStroke();
    arc(0, 0, diameter, diameter, startAngle, startAngle + sectorAngle); 
   
    //disegno le linee = fiumi
    for (let i = 0; i < rivers.length; i++) {
      //nella variabile river salvo l'oggetto in posizione i-esima nella array di oggetti rivers 
      let river = rivers[i];
      //angolo da usare per disegnare la linea i-esima nel settore angolare a cui appartiene
      //startAngle è l'angolo di partenza del settore mentre sectorAngle è l'ampiezza del settore stesso (vedi sopra) --> sectorAngle / rivers.length calcola "l'ampiezza" per ogni linea all'interno del settore. + 0.5 è un piccolo incremento che mi permette di evitare che la prima linea coincida con il bordo del settore steso
      let angle = startAngle + (i + 0.5) * (sectorAngle / rivers.length);
      //per definire la lunghezza della linea utilizzo la funzione map() di p5
      let lineLength = map(river.length, minLength, maxLength, radius * 0.325, radius * 0.62);
      //per creare il colore delle linee/fiumi ho usato lerpColor() insieme a map () come ho imparato nel secondo assigment
      let riverColor = lerpColor(coldColor, hotColor, map(river.temperature, minTemp, maxTemp, 0, 1));
      let x1 = 0;
      let y1 = 0;
      let x2 = cos(angle) * lineLength; //cos per la componente orizzontale
      let y2 = sin(angle) * lineLength; //sin per la componente verticla
      stroke(riverColor);
      strokeWeight(radius*0.007);
      line(x1, y1, x2, y2);  

      //scrivo i nomi dei fiumi
      let textSpacing = 0.01 * radius;
      let textX = cos(angle) * (lineLength + textSpacing);
      let textY = sin(angle) * (lineLength + textSpacing);
      push();
      translate(textX, textY);
      rotate(angle); //testo allineato alla linea a cui corrisponde
      noStroke();
      fill(245);
      textAlign(LEFT, CENTER);
      textWrap(CHAR);
      textSize(0.02 * radius);
      textLeading(radius * 0.0175);
      textFont("Tahoma"); 
      text(river.name, 0, 0, radius*0.38);
      pop();
    }
    //aggiorno le variabili definite inizialmente per il ciclo successivo 
    startAngle += sectorAngle; //che è l'abbreviazione di startAngle = startAngle +sectorAngle;
    continentIndex++; //che l'abbreviazione di continentIndex = continentIndex+1;
  }
  //cerchio centrale di dimensioni proporzionali a quello grande
  fill("#CBD1D2");
  noStroke();
  circle(0, 0, 0.2 * radius);  
}

//legenda
function drawLegend(legendHeight) {
  //calcolo gli elementi tot da inserire in legenda
  //w3school: The Object.keys() method returns an array with the keys of an object
  //recupero il numero di continenti dall'oggetto continents poi aggiungo 2 (valori temperatura) + 1 per lunghezza
  let legendItems = Object.keys(continents).length + 3; 
  let legendWidth = width * 0.9;
  let elementSize = min(legendHeight * 0.4, legendWidth / (legendItems * 3.1));
  let lineLength = elementSize * 2;    
  let textCorpo = min(height * 0.012, width * 0.00975);;   
  //spacing tra gli elementi, è sempre numero di elementi - 1
  let spacing = (legendWidth - ((elementSize * (legendItems - 1)) + lineLength)) / (legendItems - 1);  
  let legendY = height - (legendHeight / 1.3);
  let legendX0 = (width - legendWidth) / 2;
  textSize(textCorpo);
  textAlign(CENTER, CENTER);
  textFont("Courier New"); 

  //disegno i continenti con etichette
  //ciclo for con i che itera per una array composta da tutte le chiavi (continenti) dell'oggetto continents 
  for (let i = 0; i < Object.keys(continents).length; i++) {
    //in continentName salvo il nome del continente i-esimo
    let continentName = Object.keys(continents)[i];
    //il colore di riempimento del cerchio è preso dalla array continentColors in base all'indice i 
    fill(continentColors[i]);
    noStroke();
    circle(legendX0 + elementSize/2, legendY, elementSize); 
    fill(0);
    text(continentName, legendX0 + elementSize/2, legendY + elementSize);
    //aggiorno la posizione x0 per disegnare gli altri cerchi/continenti
    legendX0 += elementSize + spacing;
  }
  
  //temperatura 1
  fill(coldColor);
  noStroke();
  circle(legendX0 + elementSize/2, legendY, elementSize);
  fill(0);
  text("Lowest avg temp", legendX0 + elementSize/2, legendY + elementSize);
  legendX0 += elementSize + spacing;

  //temperatura 2
  fill(hotColor);
  noStroke();
  circle(legendX0 + elementSize/2, legendY, elementSize);
  fill(0);
  text("Highest avg temp", legendX0 + elementSize/2, legendY + elementSize);
  legendX0 += elementSize + spacing;
  
  //lunghezza
  strokeWeight(elementSize * 0.075);
  stroke(0);
  line(legendX0, legendY, legendX0 + lineLength, legendY);
  fill(0);
  noStroke();
  text("Rivers' length", legendX0 + lineLength/2, legendY + elementSize);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}