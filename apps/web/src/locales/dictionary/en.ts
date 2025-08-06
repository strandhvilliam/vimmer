export default {
  hello: "Hello",
  "hello.world": "Hello world!",
  welcome: "Hello {name}!",

  // Common
  loading: "Loading...",
  staff: "Staff",
  begin: "Begin",
  refresh: "Refresh",
  participant: "Participant",

  // Participate page
  "participate.gettingStarted": "Getting Started",
  "participate.chooseLanguage": "Choose Language",
  "participate.competitionRules": "Information",
  "participate.termsAccept": "I accept the organizers",
  "participate.termsAndConditions": "terms and conditions",
  "participate.datesToBeAnnounced": "Dates to be announced",

  // Confirmation page
  "confirmation.congratulations": "Congratulations!",
  "confirmation.photosUploaded":
    "Your {count} photos are uploaded and ready for judging! Good work!",
  "confirmation.yourPhotos": "Your Photos",
  "confirmation.whatsNext": "What's Next?",
  "confirmation.judgingPhase": "Judging Phase",
  "confirmation.judgingDescription":
    "Our expert jury will review all submissions",
  "confirmation.resultsAnnounced": "Results Announced",
  "confirmation.resultsDescription": "Winners will be contacted",
  "confirmation.shareWork": "Share Your Work",
  "confirmation.shareDescription": "You can share your photos after results",
  "confirmation.loadingSubmission": "Loading your submission...",

  // Verification page
  "verification.almostThere": "Almost there!",
  "verification.showQrCode":
    "Show this QR code to a crew member to verify your submission.",
  "verification.refreshAvailable": "Refresh available in {seconds}s",

  // Submission steps - Step Navigator
  "steps.number": "Number",
  "steps.details": "Details",
  "steps.class": "Class",
  "steps.device": "Device",
  "steps.upload": "Upload",

  // Submission steps - Participant Number Step
  "participantNumber.title": "Your Participant Number",
  "participantNumber.description":
    "Please enter your participant number to continue",
  "participantNumber.continue": "Continue",
  "participantNumber.participantExists": "Participant already exists",
  "participantNumber.createFailed": "Failed to create participant",
  "participantNumber.required": "Participant reference is required.",
  "participantNumber.numbersOnly": "Only numbers are allowed.",

  // Submission steps - Participant Details Step
  "participantDetails.title": "Your Details",
  "participantDetails.description": "Please enter your personal information",
  "participantDetails.firstName": "First Name",
  "participantDetails.lastName": "Last Name",
  "participantDetails.email": "Email Address",
  "participantDetails.firstNameRequired": "First name is required",
  "participantDetails.lastNameRequired": "Last name is required",
  "participantDetails.invalidEmail": "Invalid email address",
  "participantDetails.continue": "Continue",
  "participantDetails.back": "Back",

  // Submission steps - Class Selection Step
  "classSelection.title": "Choose Your Class",
  "classSelection.description": "Select the class you want to compete in",
  "classSelection.continue": "Continue",
  "classSelection.back": "Back",

  // Submission steps - Device Selection Step
  "deviceSelection.title": "Choose Your Device",
  "deviceSelection.description":
    "Select the device you've used during the marathon",
  "deviceSelection.continue": "Continue",
  "deviceSelection.back": "Back",

  // Submission steps - Upload Submissions Step
  "uploadSubmissions.title": "Upload Your Photos",
  "uploadSubmissions.description": "Submit your photos for each topic below",
  "uploadSubmissions.back": "Back",
  "uploadSubmissions.unexpectedError": "An unexpected error occurred",
  "uploadSubmissions.unableToDetermineClass": "Unable to determine class",
  "uploadSubmissions.maxPhotosReached": "Maximum number of photos reached",
  "uploadSubmissions.invalidFileType": "Invalid file type: {extension}",
  "uploadSubmissions.noFileExtension": "NO FILE EXTENSION",

  // Upload Instructions Dialog
  "uploadInstructions.title": "Before You Upload",
  "uploadInstructions.description":
    "Please read these instructions carefully before uploading your photos",
  "uploadInstructions.localPhotosTitle": "Use Local Photos Only",
  "uploadInstructions.localPhotosDescription":
    "Do not use photos stored in the cloud. Use photos stored locally on your phone or device.",
  "uploadInstructions.connectionTitle": "Stable Internet Connection",
  "uploadInstructions.connectionDescription":
    "Make sure you have a good and stable internet connection before starting the upload.",
  "uploadInstructions.doubleCheckTitle": "Double-Check Your Submission",
  "uploadInstructions.doubleCheckDescription":
    "Before submitting, please double-check your photos. You cannot change your submission after uploading!",
  "uploadInstructions.patienceTitle": "Be Patient During Upload",
  "uploadInstructions.patienceDescription":
    "Large photos may take time to upload. Please don't close the browser or navigate away during the process.",
  "uploadInstructions.gotIt": "Got it!",
} as const;
