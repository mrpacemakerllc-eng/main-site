// Google Analytics 4 tracking utilities

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Track custom events
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Predefined event trackers for common actions
export const analytics = {
  // User events
  signUp: (method: "email" | "google") => {
    event({
      action: "sign_up",
      category: "User",
      label: method,
    })
  },

  signIn: (method: "email" | "google") => {
    event({
      action: "login",
      category: "User",
      label: method,
    })
  },

  // Course events
  viewCourse: (courseId: string, courseName: string) => {
    event({
      action: "view_course",
      category: "Course",
      label: `${courseId} - ${courseName}`,
    })
  },

  startCheckout: (courseId: string, courseName: string, paymentType: "one_time" | "subscription") => {
    event({
      action: "begin_checkout",
      category: "Ecommerce",
      label: `${courseName} - ${paymentType}`,
    })
  },

  completePurchase: (courseId: string, courseName: string, value: number, paymentType: "one_time" | "subscription") => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "purchase", {
        transaction_id: `${Date.now()}-${courseId}`,
        value: value / 100, // Convert cents to dollars
        currency: "USD",
        items: [{
          item_id: courseId,
          item_name: courseName,
          item_category: "Course",
          item_variant: paymentType,
          price: value / 100,
          quantity: 1,
        }],
      })
    }
  },

  // Learning events
  startVideo: (videoId: string, videoTitle: string, courseId: string) => {
    event({
      action: "video_start",
      category: "Learning",
      label: `${courseId} - ${videoTitle}`,
    })
  },

  completeVideo: (videoId: string, videoTitle: string, courseId: string) => {
    event({
      action: "video_complete",
      category: "Learning",
      label: `${courseId} - ${videoTitle}`,
    })
  },

  startExam: (examId: string, examTitle: string, courseId: string) => {
    event({
      action: "exam_start",
      category: "Assessment",
      label: `${courseId} - ${examTitle}`,
    })
  },

  completeExam: (examId: string, examTitle: string, courseId: string, score: number, passed: boolean) => {
    event({
      action: "exam_complete",
      category: "Assessment",
      label: `${courseId} - ${examTitle}`,
      value: score,
    })

    // Track pass/fail separately
    event({
      action: passed ? "exam_passed" : "exam_failed",
      category: "Assessment",
      label: `${courseId} - ${examTitle}`,
      value: score,
    })
  },

  // Engagement events
  downloadStudyGuide: (courseId: string) => {
    event({
      action: "download",
      category: "Engagement",
      label: `Study Guide - ${courseId}`,
    })
  },

  shareContent: (contentType: string, contentId: string) => {
    event({
      action: "share",
      category: "Engagement",
      label: `${contentType} - ${contentId}`,
    })
  },

  // Conversion tracking
  clickCTA: (location: string, ctaText: string) => {
    event({
      action: "cta_click",
      category: "Conversion",
      label: `${location} - ${ctaText}`,
    })
  },

  selectPaymentPlan: (planType: "one_time" | "subscription") => {
    event({
      action: "select_payment_plan",
      category: "Conversion",
      label: planType,
    })
  },
}
