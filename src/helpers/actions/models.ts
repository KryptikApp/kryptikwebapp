import { WalletAction as WalletActionDb } from "@prisma/client";
import { getRandomAvatarPhoto } from "../auth";

export type IActionParams = {
  action: WalletActionDb;
  status: ActionStatus;
};

/**
 * An action is a task that a user can complete.
 *
 * @remarks
 * This class is useful for tracking user progress.
 */
export class WalletAction {
  private status: ActionStatus;
  private description: string;
  private title: string;
  private hexColor: string;
  private id: number;
  private iconPath: string | null;
  constructor(params: IActionParams) {
    this.status = params.status;
    this.description = params.action.description;
    this.title = params.action.title;
    this.hexColor = params.action.hexColor;
    this.id = params.action.id;
    this.iconPath = params.action.imgPath;
  }
  public isDone(): boolean {
    return this.status === ActionStatus.Done;
  }
  public markDone(): void {
    this.status = ActionStatus.Done;
  }
  public isSkipped(): boolean {
    return this.status === ActionStatus.Skipped;
  }
  public markSkipped(): void {
    this.status = ActionStatus.Skipped;
  }
  public getDescription(): string {
    return this.description;
  }
  public getTitle(): string {
    return this.title;
  }
  public getHexColor(): string {
    return this.hexColor;
  }
  public getId(): number {
    return this.id;
  }
  public getIcon(): string {
    return this.iconPath || getRandomAvatarPhoto();
  }
}

export enum ActionStatus {
  Open = "OPEN",
  Done = "DONE",
  Skipped = "SKIPPED",
}
