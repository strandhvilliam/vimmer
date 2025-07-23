export default {
  hello: "Hej",
  "hello.world": "Hej värld!",
  welcome: "Hej {name}!",

  // Common
  loading: "Laddar...",
  staff: "Personal",
  begin: "Börja",
  refresh: "Uppdatera",
  participant: "Deltagare",

  // Participate page
  "participate.gettingStarted": "Kom igång",
  "participate.chooseLanguage": "Välj språk",
  "participate.competitionRules": "Tävlingsregler & Info",
  "participate.rulesWelcome":
    "Välkommen till vår årliga fototävling! Här är de viktigaste reglerna:",
  "participate.rulesOriginal":
    "Alla foton måste vara original och tagna av dig",
  "participate.rulesFormat": "Foton måste skickas in i JPG- eller PNG-format",
  "participate.rulesFileSize": "Maximal filstorlek: 10MB per foto",
  "participate.rulesDeadline": "Sista inlämningsdag: 15 augusti 2025",
  "participate.rulesAnnouncement":
    "Vinnare kommer att meddelas den 1 september 2025",
  "participate.termsAccept": "Jag accepterar",
  "participate.termsAndConditions": "villkoren",
  "participate.datesToBeAnnounced": "Datum kommer att meddelas",

  // Confirmation page
  "confirmation.congratulations": "Grattis!",
  "confirmation.photosUploaded":
    "Dina {count} foton är uppladdade och redo för bedömning! Bra jobbat!",
  "confirmation.yourPhotos": "Dina foton",
  "confirmation.whatsNext": "Vad händer nu?",
  "confirmation.judgingPhase": "Bedömningsfas",
  "confirmation.judgingDescription":
    "Vår expertjury kommer att granska alla bidrag",
  "confirmation.resultsAnnounced": "Resultat meddelas",
  "confirmation.resultsDescription": "Vinnare kommer att kontaktas via e-post",
  "confirmation.shareWork": "Dela ditt arbete",
  "confirmation.shareDescription":
    "Du kan dela dina foton efter att resultaten är klara",
  "confirmation.loadingSubmission": "Laddar ditt bidrag...",

  // Verification page
  "verification.almostThere": "Nästan klar!",
  "verification.showQrCode":
    "Visa denna QR-kod för en besättningsmedlem för att verifiera ditt bidrag.",
  "verification.refreshAvailable": "Uppdatering tillgänglig om {seconds}s",

  // Submission steps - Step Navigator
  "steps.number": "Nummer",
  "steps.details": "Detaljer",
  "steps.class": "Klass",
  "steps.device": "Enhet",
  "steps.upload": "Ladda upp",

  // Submission steps - Participant Number Step
  "participantNumber.title": "Ditt deltagarnummer",
  "participantNumber.description":
    "Vänligen ange ditt deltagarnummer för att fortsätta",
  "participantNumber.continue": "Fortsätt",
  "participantNumber.participantExists": "Deltagare finns redan",
  "participantNumber.createFailed": "Misslyckades med att skapa deltagare",
  "participantNumber.required": "Deltagarnummer krävs.",
  "participantNumber.numbersOnly": "Endast siffror är tillåtna.",

  // Submission steps - Participant Details Step
  "participantDetails.title": "Dina uppgifter",
  "participantDetails.description": "Vänligen ange din personliga information",
  "participantDetails.firstName": "Förnamn",
  "participantDetails.lastName": "Efternamn",
  "participantDetails.email": "E-postadress",
  "participantDetails.firstNameRequired": "Förnamn krävs",
  "participantDetails.lastNameRequired": "Efternamn krävs",
  "participantDetails.invalidEmail": "Ogiltig e-postadress",
  "participantDetails.continue": "Fortsätt",
  "participantDetails.back": "Tillbaka",

  // Submission steps - Class Selection Step
  "classSelection.title": "Välj din klass",
  "classSelection.description": "Välj den klass du vill tävla i",
  "classSelection.continue": "Fortsätt",
  "classSelection.back": "Tillbaka",

  // Submission steps - Device Selection Step
  "deviceSelection.title": "Välj din enhet",
  "deviceSelection.description": "Välj den enhet du har använt under maratonet",
  "deviceSelection.continue": "Fortsätt",
  "deviceSelection.back": "Tillbaka",

  // Submission steps - Upload Submissions Step
  "uploadSubmissions.title": "Ladda upp dina foton",
  "uploadSubmissions.description": "Skicka in dina foton för varje ämne nedan",
  "uploadSubmissions.back": "Tillbaka",
  "uploadSubmissions.unexpectedError": "Ett oväntat fel inträffade",
  "uploadSubmissions.unableToDetermineClass": "Kan inte bestämma klass",
  "uploadSubmissions.maxPhotosReached": "Maximalt antal foton uppnått",
  "uploadSubmissions.invalidFileType": "Ogiltig filtyp: {extension}",
  "uploadSubmissions.noFileExtension": "INGEN FILÄNDELSE",
} as const;
