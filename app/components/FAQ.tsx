"use client"

import { useState } from "react"

interface FAQItem {
  question: string
  answer: string
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      question: "What is the IBHRE CCDS certification?",
      answer: "The International Board of Heart Rhythm Examiners (IBHRE) Certified Cardiac Device Specialist (CCDS) is a professional credential that demonstrates expertise in cardiac rhythm device management. It validates your knowledge in pacemaker and ICD programming, troubleshooting, patient management, and safety protocols. This certification is recognized globally and is highly valued by employers in cardiology departments, EP labs, and device clinics."
    },
    {
      question: "How long does it take to complete the course?",
      answer: "Most students complete the course in 6-8 weeks studying 10-15 hours per week. However, you have lifetime access to all materials, so you can learn at your own pace. Some students with extensive device experience complete it in 4 weeks, while others prefer to take 12 weeks for thorough preparation. The course is designed to be flexible around your work schedule."
    },
    {
      question: "What's included in the $199 course?",
      answer: "Your enrollment includes: Complete video curriculum covering all IBHRE exam domains, downloadable study guides and reference materials, pre-test and post-test assessments for each section, practice exam questions, lifetime access to all content including future updates, mobile-friendly platform for studying anywhere, progress tracking dashboard, and dedicated support via email. Plus, you get immediate access to our free 'Are you ready for the IBHRE CCDS?' study guide."
    },
    {
      question: "Is there a payment plan available?",
      answer: "Yes! We offer a flexible 3-month payment plan at $67/month with no interest or hidden fees. Total cost is $201 for the payment plan ($199 if paid upfront). This makes it easier to invest in your career without a large upfront cost. You'll get full access to the course immediately upon enrollment."
    },
    {
      question: "What is your first-attempt pass rate?",
      answer: "87% of our students pass the IBHRE CCDS exam on their first attempt, compared to the national average of approximately 65-70%. Our structured approach, comprehensive practice questions, and exam-weighted curriculum contribute to this higher success rate. We also provide guidance on exam registration, test-taking strategies, and what to expect on exam day."
    },
    {
      question: "Do I need prior device experience to take this course?",
      answer: "While some cardiovascular background is helpful, our course is designed for all experience levels. We start with fundamentals and progressively build to advanced concepts. Many nurses, techs, and PAs with limited device exposure have successfully completed the course and passed their CCDS exam. The structured format with knowledge checks ensures you master each topic before moving forward."
    },
    {
      question: "How does the course compare to in-person training?",
      answer: "Our online course costs $199 vs. $2,000-5,000 for in-person training. You get the same comprehensive content with added flexibility: learn at your own pace, lifetime access to review materials, and study from anywhere. No travel expenses or time away from work required."
    },
    {
      question: "Can I access the course on mobile devices?",
      answer: "Absolutely! The platform is fully responsive and works seamlessly on smartphones, tablets, and computers. You can watch videos during your commute, review materials on breaks, and track your progress from any device. Your progress syncs automatically across all devices so you can pick up right where you left off."
    },
    {
      question: "What if I don't pass the exam?",
      answer: "While 87% of our students pass on their first attempt, we understand that test anxiety or difficult exam questions can affect anyone. You have lifetime access to the course, so you can review materials and retake practice tests as many times as needed. We also offer personalized support to help identify weak areas and focus your study efforts for your next attempt. The IBHRE allows retakes after a waiting period."
    },
    {
      question: "How current is the course content?",
      answer: "Our course is updated regularly to reflect the latest IBHRE exam content outline and current device technology. We monitor changes to the exam blueprint and update materials accordingly. As a lifetime member, you automatically get access to all updates at no additional cost. This ensures you're always studying the most relevant and current information."
    },
    {
      question: "Do you offer support if I have questions?",
      answer: "Yes! We provide email support for all enrolled students. Typically, questions are answered within 24-48 hours on business days. Common questions include clarification on complex topics, study schedule recommendations, exam registration guidance, and technical platform support. We're here to help you succeed."
    },
    {
      question: "What are the prerequisites for taking the IBHRE CCDS exam?",
      answer: "The IBHRE requires professional experience in cardiac device management, typically 1-2 years depending on your role and education level. Specific requirements vary by profession (RN, PA, MD, tech, etc.). You can review detailed eligibility criteria on the IBHRE.org website. Our course prepares you for the knowledge portion of the exam - we recommend confirming your eligibility with IBHRE before or during your studies."
    },
    {
      question: "How do I register for the actual IBHRE exam?",
      answer: "After completing our course and feeling prepared, you'll register directly through IBHRE.org. The exam fee (separate from our course) is typically $400-600 depending on your membership status. IBHRE offers exams at testing centers nationwide and internationally. We provide guidance in the course on the registration process, what to bring, and what to expect on exam day."
    },
    {
      question: "Can I get a refund if the course isn't right for me?",
      answer: "We offer a 7-day money-back guarantee. If you're not satisfied with the course within the first 7 days of enrollment, contact us for a full refund. This gives you time to explore the content and determine if it meets your needs. After 7 days, all sales are final due to the digital nature of the product."
    },
    {
      question: "Will this course help me with CEPS or RCES certification too?",
      answer: "While this course specifically targets the CCDS exam, there is significant overlap with the Clinical Cardiac Electrophysiology Specialist (CEPS) and Registered Cardiac Electrophysiology Specialist (RCES) exams. Many students use our CCDS course as a foundation and then supplement with additional CEPS/RCES-specific materials. Several of our testimonials are from professionals who passed multiple certifications."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Know
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get answers to common questions about the IBHRE CCDS exam and our course
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-lg"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white text-lg pr-8">
                  {faq.question}
                </span>
                <svg
                  className={`w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 transition-transform ${
                    openIndex === index ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-5 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-3">Still Have Questions?</h3>
          <p className="text-blue-100 mb-6">
            We're here to help! Contact us and we'll get back to you within 24-48 hours.
          </p>
          <a
            href="mailto:support@mrpacemakerllc.com"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Email Support
          </a>
        </div>
      </div>
    </section>
  )
}
