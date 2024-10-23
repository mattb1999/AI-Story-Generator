// fase di preparazione
//raccolgiamo gli elementi di interesse dalla pagina, come il main e tutti i sottostanti, 
//così che ne possiamo gestire il contenuto
//ad ogni variabile è possibile applicare tanti metodi

const mainSection = document.querySelector('main');
const nameField = document.querySelector('input');
const emojiElements = document.querySelectorAll('.emoji');
const generateButton = document.querySelector('#generate');

const storyTitle = document.querySelector('.story-title');
const storyText = document.querySelector('.story-text');
const homeButton = document.querySelector('#home');
const continueButton = document.querySelector('#continue');

//facciamo un array di emoji
const selectedEmoji = [];

//lista di messaggi perchè andremo ad interfacciarci con chat gpt
const chatMessages = [];

const endpoint = 'https://api.openai.com/v1/chat/completions'
const API_KEY = ''

//colora gli elementi le cui emoji sono in lista
function colorSelectedEmojis() {
    for (const element of emojiElements) {
        const emoji = element.innerText
        if (selectedEmoji.includes(emoji)) {
            element.classList.add('selected')
        } else {
            element.classList.remove('selected')
        }
    }
}
async function createStory(prompt) {
    //lo aggiungo alla lista di messaggi
    chatMessages.push(prompt)

    //mostro la schermata di caricamento
    mainSection.className = 'loading'

    //chiamiamo GPT
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: chatMessages,
            temperature: 0.7

        })
    });
    //elaboriamo la risposta con il metodo json
    const data = await response.json();

    //recuperiamo la storia, choices perchè chat ci da più scelte. quinid recuperiamo il data.choices[0]
    const story = JSON.parse(data.choices[0].message.content)

    //mettiamo la risposta nella lista dei messaggi per far continuare la storia con un nuovo prompt
    chatMessages.push({
        role: 'assistant',
        content: JSON.stringify(story)
    })

    //inseriamo la storia all'interno della pagina
    storyTitle.innerText = story.title
    storyText.innerText = story.text

    //mostra la  schermata result
    mainSection.className = 'result'
}
//fase di gestione eventi
//andiamo a creare una funzione nell'event listener che ascolta i click dell'utente e riempie la lista delle emoji selezionate
//
for (const element of emojiElements) {
    element.addEventListener('click', function () {
        const clickedEmoji = element.innerText
        if (selectedEmoji.includes(clickedEmoji)) {
            console.warn(`Emoji ${clickedEmoji} già presente`)
            return
        }
        selectedEmoji.push(clickedEmoji)
        if (selectedEmoji.length > 3) {
            console.warn('Ci sono troppe emoji. tolgo la prima')
            selectedEmoji.shift()
        }

        colorSelectedEmojis();

        console.log(selectedEmoji)
    })
};

//al click del bottone GENERA
generateButton.addEventListener('click', async function () {
    const name = nameField.value
    if (selectedEmoji.length < 3 || name.length < 2) {
        window.alert('Devi selezionare 3 emoji e inserire un nome')
        return
    }

    //preparo il messaggio iniziale
    const prompt = {
        role: 'user',
        content: `Crea una storia a partire da queste emoji: ${selectedEmoji}. Il protagonista della storia
        si chiama ${name}. La storia deve essere breve e avere un titolo, anceh questo molto breve. Le tue risposte sono solo 
        in formato JSON come questo esempio:
        
        {
        "title": "Incontro intergalattico",
        "text":"Durante un'esplorazione nottruna, Alberto Angela s'imbatte in un'astronave aliena atterrata a Roma. Gli
        extraterrestri cercano aiuto contro un'orda di gatti robotici. Angela li aiuta e in cambio gli alieni gli regalano un'astronave.",
        }
        Assicurati che le chiavi JSON siano "title" e "text", con virgolette.`
    }
    //USARE LA FUNZIONE
    createStory(prompt)

})

//al click sul bottone avanti
continueButton.addEventListener('click', function () {
    //prepariamo un nuovo prompt
    const prompt = {
        role: 'user',
        content: `Continua la storia da qui. Scrivi un breve paragrafo che prosegua la storia precedente. Le tue risposte
        sono solo in formato JSON con lo stesso formato delle tue risposte precedenti. Mantieni lo stesso valore per "title".
        Cambia solo il valore di "text"`
    }

    //crea storia
    createStory(prompt)
})

//al click del bottone home
homeButton.addEventListener('click', function () {
    //ricarica la pagina
    window.location.reload()
})