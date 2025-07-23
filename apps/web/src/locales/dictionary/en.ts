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
  "participate.competitionRules": "Competition Rules & Info",
  "participate.rulesWelcome":
    "Welcome to our annual photo competition! Here are the key rules:",
  "participate.rulesOriginal": "All photos must be original and taken by you",
  "participate.rulesFormat": "Photos must be submitted in JPG or PNG format",
  "participate.rulesFileSize": "Maximum file size: 10MB per photo",
  "participate.rulesDeadline": "Submission deadline: August 15, 2025",
  "participate.rulesAnnouncement":
    "Winners will be announced on September 1, 2025",
  "participate.termsAccept": "I accept the",
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
  "confirmation.resultsDescription": "Winners will be contacted via email",
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
} as const;
