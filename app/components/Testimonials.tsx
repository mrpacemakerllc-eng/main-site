export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah M., RN, CCDS",
      role: "Cardiac Device Nurse",
      hospital: "Johns Hopkins Hospital",
      image: "https://ui-avatars.com/api/?name=Sarah+M&background=3b82f6&color=fff&size=80",
      quote: "This course was instrumental in helping me pass the IBHRE CCDS exam on my first attempt. The video lessons were clear, comprehensive, and directly aligned with the exam content.",
      rating: 5,
      result: "Passed CCDS - First Attempt"
    },
    {
      name: "Michael Chen, PA-C, CCDS",
      role: "Physician Assistant",
      hospital: "Cleveland Clinic",
      image: "https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff&size=80",
      quote: "The pre/post test system helped me identify my weak areas and track my progress. The practice exams were incredibly similar to the actual IBHRE exam. Highly recommend!",
      rating: 5,
      result: "Score: 92% on CCDS Exam"
    },
    {
      name: "Jennifer Rodriguez, CVT, CCDS",
      role: "Cardiovascular Technologist",
      hospital: "Mayo Clinic",
      image: "https://ui-avatars.com/api/?name=Jennifer+Rodriguez&background=8b5cf6&color=fff&size=80",
      quote: "As someone with limited device experience, this course gave me the confidence and knowledge I needed. The section-by-section breakdown made complex topics easy to understand.",
      rating: 5,
      result: "Passed CCDS after 6 weeks"
    },
    {
      name: "David Park, MD, CCDS",
      role: "Electrophysiologist",
      hospital: "Massachusetts General",
      image: "https://ui-avatars.com/api/?name=David+Park&background=f59e0b&color=fff&size=80",
      quote: "Even as an experienced EP, this course helped me prepare efficiently for the CCDS exam. The exam weight percentages guided my study focus perfectly.",
      rating: 5,
      result: "Passed CCDS + CEPS"
    },
    {
      name: "Lisa Thompson, RN, CCDS",
      role: "Pacemaker Clinic Coordinator",
      hospital: "Stanford Health Care",
      image: "https://ui-avatars.com/api/?name=Lisa+Thompson&background=ef4444&color=fff&size=80",
      quote: "The lifetime access is a game-changer. I still reference the videos when I encounter unusual device behaviors in clinic. Worth every penny!",
      rating: 5,
      result: "Passed on First Try - 89%"
    },
    {
      name: "Robert Williams, RT(R), CCDS",
      role: "Radiology Tech - EP Lab",
      hospital: "Duke University Hospital",
      image: "https://ui-avatars.com/api/?name=Robert+Williams&background=06b6d4&color=fff&size=80",
      quote: "The structured approach with knowledge checks after each section kept me accountable. I studied for 8 weeks and passed with confidence. Best investment in my career!",
      rating: 5,
      result: "Certified CCDS - 2024"
    }
  ]

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            SUCCESS STORIES
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Join Over 500+ Certified Professionals
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Real students, real results. See what our community is saying about their success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
            >
              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "{testimonial.quote}"
              </p>

              {/* Result Badge */}
              <div className="mb-4 inline-block">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                  ✓ {testimonial.result}
                </span>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {testimonial.hospital}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
            <div className="text-gray-600 dark:text-gray-300">Certified Professionals</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">87%</div>
            <div className="text-gray-600 dark:text-gray-300">First-Attempt Pass Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">4.9/5</div>
            <div className="text-gray-600 dark:text-gray-300">Average Rating</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
            <div className="text-gray-600 dark:text-gray-300">Course Access</div>
          </div>
        </div>
      </div>
    </section>
  )
}
