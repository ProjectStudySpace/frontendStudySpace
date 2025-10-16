type ReviewsUpdateListener = () => void;

class ReviewsUpdateEvent {
  private listeners: ReviewsUpdateListener[] = [];

  addListener(listener: ReviewsUpdateListener) {
    this.listeners.push(listener);
  }

  removeListener(listener: ReviewsUpdateListener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  notify() {
    this.listeners.forEach(listener => listener());
  }
}

export const reviewsUpdateEvent = new ReviewsUpdateEvent();