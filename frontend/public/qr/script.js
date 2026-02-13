document.addEventListener('DOMContentLoaded', function() {
    // 1. Les données à encoder dans le QR Code (Objet JavaScript)
    const qrData = {
        't' : 'INV', // Type d'invitation
        'g' : 'https://ll-ouest-services.fr', // Lien de l'invitation
        'e' : 'nana@gmail.com', // Email
    }; 

    // 💡 CORRECTION : Convertir l'objet JavaScript en chaîne de caractères JSON
    const qrDataString = JSON.stringify(qrData);

    // 2. Les options de personnalisation
    const qrOptions = {
        // On passe la CHAÎNE de caractères JSON à la propriété 'text'
        text: qrDataString, 
        
        // Niveau de correction d'erreur 'H' (High) est recommandé 
        // lorsque vous ajoutez un logo, car il permet d'endommager jusqu'à 30% du code.
        ecLevel: 'H', 
        size: 256,
        radius: 0.4,
        
        // Couleur de premier plan (Bleu violet)
        fill: '#536DFE', 
        background: 'white', 
    };

    // Génération du QR Code
    QrCreator.render(qrOptions, document.querySelector('#qr-code'));

});