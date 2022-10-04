const parsedCoverLetter = JSON.stringify([{"text":"To whom it may concern,\n\nI would like to apply for the ","type":0,"generatedHTML":""},{"text":"position","type":1,"generatedHTML":""},{"text":" position at ","type":0,"generatedHTML":""},{"text":"company","type":1,"generatedHTML":""},{"text":". ","type":0,"generatedHTML":""},{"text":"As an avid follower of the {industry}, I was excited to hear about the opportunity at {company}.","type":3,"generatedHTML":"","parsedNesting":[{"text":"As an avid follower of the ","type":0,"generatedHTML":""},{"text":"industry","type":1,"generatedHTML":""},{"text":", I was excited to hear about the opportunity at ","type":0,"generatedHTML":""},{"text":"company","type":1,"generatedHTML":""},{"text":".","type":0,"generatedHTML":""}]},{"text":" Having read through the qualifications, I believe that my experience in ","type":0,"generatedHTML":""},{"text":"experience","type":1,"generatedHTML":""},{"text":" will allow me to contribute and thrive in the ","type":0,"generatedHTML":""},{"text":"environment","type":1,"generatedHTML":""},{"text":" environment fostered by ","type":0,"generatedHTML":""},{"text":"company","type":1,"generatedHTML":""},{"text":".\n\n","type":0,"generatedHTML":""},{"text":"I developed Text Automata, a tool designed to help people generate text with repetitive parts such as Cover Letters. I used HTML, CSS, and Javascript to develop the website and hosted it on AWS.","type":2,"generatedHTML":""},{"text":" ","type":0,"generatedHTML":""},{"text":"My friend and I designed and developed the Paragon, a 75% mechanical keyboard that was sold worldwide. I used Fusion360 to design the keyboard and created manufacturing drawings for factories.","type":2,"generatedHTML":""},{"text":"\n\nI would be delighted to further elaborate upon my experiences in an interview. My preferred modem of communication is via email at ","type":0,"generatedHTML":""},{"text":"email","type":1,"generatedHTML":""},{"text":" or by phone at ","type":0,"generatedHTML":""},{"text":"phone number","type":1,"generatedHTML":""},{"text":". Thank you for your consideration,\n\nSincerely,\n\n","type":0,"generatedHTML":""},{"text":"name","type":1,"generatedHTML":""}]);
const rawTemplate = JSON.stringify("To whom it may concern,\n\nI would like to apply for the {position} position at {company}. [As an avid follower of the {industry}, I was excited to hear about the opportunity at {company}.] Having read through the qualifications, I believe that my experience in {experience} will allow me to contribute and thrive in the {environment} environment fostered by {company}.\n\n[I developed Text Automata, a tool designed to help people generate text with repetitive parts such as Cover Letters. I used HTML, CSS, and Javascript to develop the website and hosted it on AWS.] [My friend and I designed and developed the Paragon, a 75% mechanical keyboard that was sold worldwide. I used Fusion360 to design the keyboard and created manufacturing drawings for factories.]\n\nI would be delighted to further elaborate upon my experiences in an interview. My preferred modem of communication is via email at {email} or by phone at {phone number}. Thank you for your consideration,\n\nSincerely,\n\n{name}");

document.getElementById("tutorial-link-to-template").addEventListener("click", function(){
    sessionStorage.setItem("rawTemplate", rawTemplate);
    sessionStorage.setItem("parsedTemplate", parsedCoverLetter);
    window.open("index.html", "_self");
});

document.getElementById("tutorial-link-to-generate").addEventListener("click", function(){
    sessionStorage.setItem("rawTemplate", rawTemplate);
    sessionStorage.setItem("parsedTemplate", parsedCoverLetter);
    window.open("generate.html", "_self");
});