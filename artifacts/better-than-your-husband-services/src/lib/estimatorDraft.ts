export type EstimatorDraft = {
  serviceId: string;
  serviceLabel: string;
  summary: string;
};

let currentEstimatorDraft: EstimatorDraft | null = null;

export function setEstimatorDraft(draft: EstimatorDraft) {
  currentEstimatorDraft = draft;
}

export function getEstimatorDraft() {
  return currentEstimatorDraft;
}