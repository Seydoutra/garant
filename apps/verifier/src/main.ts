import "./style.css";
import { getInitialState } from "./state";
const state = getInitialState();
const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Missing application root");
app.dataset.state = state.kind;
app.innerHTML = `<main><a class="brand" href="/v">GARANT<span>VÉRIFICATION DOCUMENTAIRE</span></a><div class="status">Service non connecté</div><h1>Vérifier un document</h1><p class="lead">Le socle du portail public est prêt. Le vérificateur cryptographique et le registre documentaire ne sont pas encore disponibles.</p><section aria-labelledby="verification-state"><h2 id="verification-state">Aucun résultat de vérification</h2><p>Ce shell ne décode, ne signe et ne valide aucun cachet. Un document présenté ici ne doit pas être considéré comme authentifié.</p><label for="code">Code du document</label><input id="code" placeholder="GRT-XXXX-XXXX" disabled><button disabled>Vérification non implémentée</button><p class="fine">Le scan caméra, le fonctionnement hors ligne et la synchronisation seront ajoutés lors des tâches dédiées.</p></section><footer>GARANT · Socle local du MVP · tâche 01</footer></main>`;
