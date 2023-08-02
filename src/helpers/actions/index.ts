import { WalletAction as WalletActionDb } from "@prisma/client";
import { KryptikFetch } from "../../kryptikFetch";
import { ActionStatus, WalletAction } from "./models";

export async function getCompletedActionsByUser(): Promise<WalletActionDb[]> {
  // make request to api to get completed actions
  const res = await KryptikFetch(`/api/actions/completed`, {
    method: "GET",
  });
  // check if request was successful
  if (!res.data || res.status !== 200 || !res.data.actions) {
    return [];
  }
  return res.data.actions;
}

export async function fetchAllActions(): Promise<WalletActionDb[]> {
  // make request to api to get completed actions
  const res = await KryptikFetch(`/api/actions/all`, {
    method: "GET",
  });
  // check if request was successful
  if (!res.data || res.status !== 200 || !res.data.actions) {
    return [];
  }
  return res.data.actions;
}

export async function markActionComplete(actionId: number) {
  // make request to api to get completed actions
  const res = await KryptikFetch(`/api/actions/markComplete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ actionId }),
  });
  // check if request was successful
  if (!res.data || res.status !== 200 || !res.data.success) {
    return false;
  }
  return true;
}

export async function getActionsByCategory(
  completeActions?: WalletActionDb[],
  allActions?: WalletActionDb[]
): Promise<{ open: WalletAction[]; complete: WalletAction[] }> {
  let completeActionsToUse =
    completeActions || (await getCompletedActionsByUser());
  let allActionsToUse = allActions || (await fetchAllActions());
  // filter out completed actions
  const openActions = allActionsToUse.filter((action) => {
    // check if action is in completed actions
    const actionInCompleted = completeActionsToUse.find(
      (completeAction) => completeAction.id === action.id
    );
    // if action is not in completed actions, return true
    if (!actionInCompleted) {
      return true;
    }
    // else return false
    return false;
  });
  // convert to action class
  const openActionsClass = openActions.map((action) => {
    return new WalletAction({ action, status: ActionStatus.Open });
  });
  const completeActionsClass = completeActionsToUse.map((action) => {
    return new WalletAction({ action, status: ActionStatus.Done });
  });
  return { open: openActionsClass, complete: completeActionsClass };
}
