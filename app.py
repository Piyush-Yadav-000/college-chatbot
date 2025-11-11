from flask import Flask, render_template, request, jsonify
from datetime import datetime
import os
import re
from difflib import SequenceMatcher

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')

class CollegeChatbot:
    def __init__(self):
        self.intents = {
    "courses": {
        "patterns": ["course", "program", "degree", "b.tech", "m.tech", "bca", "mca", "mba", "bba", "bsc", "bcom", "ba", "phd", "mpt", "bpt"],
        "response": "MRIIRS offers 98+ programs including B.Tech, M.Tech, MBA, MCA, BCA, BBA, B.Com, BA (Hons), B.Sc, BPT, MPT, PhD and more across Engineering, Management, Computer Applications, Commerce, Arts, Medical, and Design streams. Which program interests you?"
    },
    
    "admission": {
        "patterns": ["admission", "apply", "enroll", "join", "entrance", "eligibility", "how to apply", "mrnat", "application"],
        "response": "Admissions are open! Apply online at manavrachna.edu.in. Application fee: ₹1,200. Admission process includes MRNAT entrance test or JEE Main/CAT/MAT scores. You can apply for up to 3 program choices. Admission Helpdesk: 0129-4259000 (Mon-Fri, 9 AM - 5 PM)"
    },
    
    "fees": {
        "patterns": ["fee", "fees", "cost", "tuition", "price", "scholarship", "financial", "how much"],
        "response": "Fee structure varies by program: B.Tech: ₹2.01-2.88 Lakhs/year, MBA: ₹3.71-4.21 Lakhs/year, BCA: ₹2.05 Lakhs/year, MCA: ₹2.06 Lakhs/year, BA/B.Com: ₹1.79-1.9 Lakhs/year. Hostel fees: Boys ₹1.75 Lakhs/year, Girls ₹2.7 Lakhs/year."
    },
    
    "hostel": {
        "patterns": ["hostel", "accommodation", "stay", "room", "residence", "dormitory"],
        "response": "Yes! MRIIRS provides separate hostels for boys and girls with modern amenities including Wi-Fi, 24x7 security, mess facilities, recreational areas, and study rooms. Hostel fee: ₹1.75 Lakhs/year (Boys), ₹2.7 Lakhs/year (Girls)."
    },
    
    "placement": {
        "patterns": ["placement", "job", "company", "career", "recruited", "package", "salary", "recruiter"],
        "response": "MRIIRS has QS 5-Star rating for Employability! 2023 Placements: Highest package 54 LPA, 549+ students placed, 183+ recruiters including TCS, Infosys, Wipro, Accenture, Capgemini, American Express, KPMG, Nokia, Amazon, and Google."
    },
    
    "contact": {
        "patterns": ["contact", "phone", "email", "reach", "call", "number", "helpline"],
        "response": "📞 Admission Helpdesk: 0129-4259000 (30 Lines) | General Queries: 0129-4198200 | ✉️ admissions@manavrachna.edu.in | info@mrei.ac.in | Office Hours: Mon-Fri, 9:00 AM - 5:00 PM"
    },
    
    "location": {
        "patterns": ["location", "where", "address", "campus", "situated", "find", "faridabad"],
        "response": "MRIIRS is located in Sector 43, Faridabad, Haryana - easily accessible from Delhi NCR. The campus is well-connected by road and metro, approximately 25 km from South Delhi."
    },
    
    "faculty": {
        "patterns": ["faculty", "professor", "teacher", "staff", "instructor", "teaching"],
        "response": "MRIIRS has experienced faculty members from prestigious institutions like IITs, NITs, and top universities. Our faculty are experts in their fields with extensive industry and research experience."
    },
    
    "facilities": {
        "patterns": ["facilities", "infrastructure", "lab", "laboratory", "library", "sport", "gym"],
        "response": "MRIIRS offers state-of-the-art facilities including modern laboratories, a well-stocked library with 10,000+ books and e-resources, sports complex, gym, swimming pool, auditoriums, and innovation labs for hands-on learning."
    },
    
    "library": {
        "patterns": ["library", "book", "study", "resource", "reading", "e-library"],
        "response": "Our library offers 10,000+ books, digital resources, e-journals, research databases, and 24x7 study areas with high-speed internet access for students."
    },
    
    "sports": {
        "patterns": ["sport", "game", "gym", "fitness", "football", "basketball", "cricket", "athletics"],
        "response": "MRIIRS has excellent sports facilities including football, basketball, cricket, badminton, table tennis, volleyball, athletics track, gym, and fitness center. We encourage students to participate in inter-college tournaments."
    },
    
    "ranking": {
        "patterns": ["rank", "ranking", "nirf", "rating", "accreditation", "qs rating"],
        "response": "MRIIRS has NIRF Ranking 101-150 (Engineering), QS 5-Star Rating for Employability, and is NAAC A+ accredited. The institute is UGC approved and recognized globally."
    },
    
    "scholarship": {
        "patterns": ["scholarship", "financial aid", "merit", "discount", "waiver"],
        "response": "MRIIRS offers various scholarships based on merit, sports achievements, and financial need. Scholarship details are provided during admission counseling. Contact admission office for more information."
    },
    
    "online": {
        "patterns": ["online", "distance", "virtual", "remote learning", "online degree"],
        "response": "Yes! Manav Rachna offers UGC-approved online programs through Manav Rachna Online in BA, B.Com, MA, and other streams with flexible learning options."
    },
    
    "greeting": {
        "patterns": ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "namaste"],
        "response": "Hello! Welcome to Manav Rachna International Institute of Research and Studies (MRIIRS). How can I assist you today?"
    },
    
    "thanks": {
        "patterns": ["thank", "thanks", "appreciate", "helpful", "great"],
        "response": "You're welcome! Feel free to ask if you have any other questions about MRIIRS. We're here to help!"
    },
    
    "goodbye": {
        "patterns": ["bye", "goodbye", "see you", "exit", "quit"],
        "response": "Goodbye! For more information, visit manavrachna.edu.in or call 0129-4259000. Best wishes for your future!"
    }
}

    
    def classify_intent(self, user_input):
        processed = user_input.lower().strip()
        for intent, data in self.intents.items():
            for pattern in data["patterns"]:
                if pattern in processed:
                    return intent
        return None
    
    def get_response(self, user_input):
        if not user_input.strip():
            return "Please ask a question."
        
        intent = self.classify_intent(user_input)
        if intent:
            return self.intents[intent]["response"]
        return "I'm sorry, I don't have information on that. Please contact +91-9876543210."

chatbot = CollegeChatbot()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get", methods=["POST"])
def get_response():
    try:
        user_msg = request.json.get("msg", "").strip()
        
        if not user_msg or len(user_msg) > 500:
            return jsonify({"error": "Invalid message"}), 400
        
        response = chatbot.get_response(user_msg)
        return jsonify({"response": response, "timestamp": datetime.now().isoformat()})
    
    except Exception as e:
        return jsonify({"error": "Server error"}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
