import os

file_path = r"c:\Projects\Görme Engelliler derneği\admin\index.html"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

modal_html = """
  <!-- Gallery Picker Modal -->
  <div id="gallery-picker-modal" class="modal" role="dialog" aria-modal="true">
    <div class="modal-content" style="width: 95%; max-width: 800px;">
      <div class="modal-header">
        <h3 class="modal-title">Görsel Seç</h3>
        <button class="btn btn--sm btn--ghost" onclick="window.closeGalleryPicker()" style="padding:0.5rem;">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size:0.875rem; color:var(--text-faint); margin-bottom:1.5rem;">Duyuru için kullanmak istediğiniz görseli galeriden seçin.</p>
        <div id="gallery-picker-grid" class="gallery-picker-grid">
          <!-- Dynamically populated -->
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn--ghost" onclick="window.closeGalleryPicker()">İptal</button>
      </div>
    </div>
  </div>
"""

if "gallery-picker-modal" not in content:
    new_content = content.replace("</body>", modal_html + "\n</body>")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success: Modal appended.")
else:
    print("Info: Modal already exists.")
