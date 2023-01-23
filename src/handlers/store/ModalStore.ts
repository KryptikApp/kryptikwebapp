import {
  SessionTypes,
  SignClientTypes,
} from "@walletconnect/types/dist/types/sign-client";
import { proxy } from "valtio";

// model data types
interface ModalData {
  proposal?: SignClientTypes.EventArguments["session_proposal"];
  requestEvent?: SignClientTypes.EventArguments["session_request"];
  requestSession?: SessionTypes.Struct;
}

interface State {
  open: boolean;
  view?:
    | "SessionProposalModal"
    | "SessionSignModal"
    | "SessionSignTypedDataModal"
    | "SessionSendTransactionModal"
    | "SessionUnsuportedMethodModal";
  data?: ModalData;
}

// state
const state = proxy<State>({
  open: false,
});

// store and actions
const ModalStore = {
  state,

  open(view: State["view"], data: State["data"]) {
    state.view = view;
    state.data = data;
    state.open = true;
    console.log("Modal open ran!");
  },

  close() {
    state.open = false;
  },
};

export default ModalStore;
