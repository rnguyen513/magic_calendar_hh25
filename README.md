# [MyCally.Tech](https://www.mycally.tech) - Your All-in-One Study Companion

<img width="1489" alt="image" src="https://github.com/user-attachments/assets/86636806-b78d-4bbc-90be-276987bc920c" />


### ‼️ IMPORTANT
Cally currently uses a hardcoded Canvas API key that's tied to a demo account. Canvas only allows AUTHORIZED and VETTED 3rd party apps to integrate with OAuth2, which would allow a user to "sign in with Canvas". We aren't an official partner of Canvas, so that's impossible at this stage. Nevertheless, all other features such as quiz/summary generation and syllabus (or other documents) upload is still functional. We hope you see the vision!

## 📌 Inspiration  
College students juggle assignments, extracurriculars, and personal responsibilities, often feeling overwhelmed. We envisioned an application that simplifies academic life by combining learning, studying, and productivity tracking—all in one place.  

## 🚀 What It Does  
[MyCally](https://www.mycally.tech) seamlessly integrates with Canvas, allowing students to sync their courses and assignments. The app automatically extracts course data and generates a personalized calendar with due dates.  

### Key Features:  
✅ **Smart Calendar** – Organizes assignments and deadlines for better time management.  
✅ **AI-Powered Study Tools**:  
   - **Quiz Generator** – Creates quizzes based on inputted study material.  
   - **Summary Generator** – Summarizes content to enhance learning efficiency.  
✅ **AI Chatbot** – Provides instant answers on study content, deadlines, and academic queries.  

## 🛠️ How We Built It  
MyCally is built using:  
- **Next.js 14** for a seamless front-end experience.  
- **Vercel’s AI SDK** for intelligent chatbot functionalities.  
- **Canvas API** to fetch courses, assignments, and grades.  

Users link their Canvas accounts by providing an access token, which enables the app to pull relevant academic data, format it in JSON, and integrate it into AI-powered study tools.  

## ⚡ Challenges We Faced  
One major challenge was accessing user data without a Canvas API developer or admin key. To work around this, we currently require users to manually input their Canvas Access Tokens for full functionality.  

---  
📚 **MyCally** is designed to keep students organized, efficient, and stress-free. Stay on top of your studies with ease! 🚀
