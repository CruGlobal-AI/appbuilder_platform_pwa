/**
 * ABMobileViewGrid
 * A read only table of the rows in a datacollection.
 * Columns are the fields picked in settings.columns.
 */

import ABMobileViewGridCore from "../../core/mobile/ABMobileViewGridCore.js";

export default class ABMobileViewGrid extends ABMobileViewGridCore {
   async init() {
      // Nudge the F7 store so the table redraws once the DC has data.
      // (same trick as ABMobileViewList)
      setTimeout(() => {
         let dc = this.datacollection;
         if (dc) {
            let allVals = dc.$state[dc.id];
            dc.$state[dc.id] = allVals;
         }
      }, 30);
   }

   get idGrid() {
      return `G${this.id}`;
   }

   rows() {
      const dc = this.datacollection;
      if (!dc) return [];
      return this.AB.$store.getters[dc.id]?.value || [];
   }

   itemSelected(item) {
      const dc = this.datacollection;
      if (dc) {
         dc.setCursor(item[dc.datasource.PK()] || item.id || item.uuid);
      }

      if (this.settings.linkPageDetail) {
         const DetailPage = this.application.pageByID(
            this.settings.linkPageDetail,
         );
         DetailPage?.show(true);
      }
   }

   openAddPage() {
      if (this.settings.linkPageAdd) {
         const addPage = this.application.pageByID(this.settings.linkPageAdd);
         addPage?.show(true);
      }
   }

   loadMore() {
      let dc = this.datacollection;
      if (dc && dc.hasMore()) {
         this.AB.$store.dispatch("getAppBuilderData", dc.id);
      }
   }

   hasMore($h) {
      if (this.datacollection?.hasMore()) {
         return $h`<div class="preloader infinite-scroll-preloader"></div>`;
      }
      return "";
   }

   addButton($h) {
      if (!this.settings.linkPageAdd) return "";

      return $h`
<div class="float-right">
   <a
       href="#"
       class="link icon-only"
       onclick=${() => {
          this.openAddPage();
       }}
   >
   <i class="icon f7-icons if-not-md">plus</i>
   <i class="icon material-icons md-only">add</i>
   </a>
</div>`;
   }

   gridTitle($h) {
      if (this.settings.hideTitle && !this.settings.linkPageAdd) {
         return "";
      }

      return $h`
<div class="block-title block-title-medium no-margin-after">
  ${!this.settings.hideTitle ? this.label : ""}
  ${this.addButton($h)}
</div>
      `;
   }

   cell($h, field, item) {
      return $h`<td class="label-cell">${field.format(item)}</td>`;
   }

   html($h) {
      const fields = this.fields();

      if (!this.datacollection || fields.length == 0) {
         return () => $h`
            ${this.gridTitle($h)}
            <div class="block">${this.AB.Label()("No columns to show.")}</div>
         `;
      }

      return () => $h`
         ${this.gridTitle($h)}
         <div
            id=${this.idGrid}
            class="infinite-scroll-content"
            onInfinite=${() => this.loadMore()}
         >
            <div class="data-table card">
               <table>
                  <thead>
                     <tr>
                        ${fields.map(
                           (f) => $h`<th class="label-cell">${f.label}</th>`,
                        )}
                     </tr>
                  </thead>
                  <tbody>
                     ${this.rows().map(
                        (item) => $h`
                        <tr
                           data-id=${item.uuid}
                           onClick=${() => this.itemSelected(item)}
                        >
                           ${fields.map((f) => this.cell($h, f, item))}
                        </tr>`,
                     )}
                  </tbody>
               </table>
            </div>
            ${this.hasMore($h)}
         </div>`;
   }
}
