import Layout from '../components/Layout';
import { INSPECTION_CHECKLISTS } from '../data/inspectionChecklists';

export default function FieldGuide() {
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Field Guide</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(INSPECTION_CHECKLISTS).map(([type, checklist]) => (
            <div key={type} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-3 text-blue-600">
                {checklist.title}
              </h2>
              <div className="space-y-4">
                {checklist.sections.map((section, idx) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-gray-700 border-b pb-1">
                      {section.title}
                    </h3>
                    <ul className="mt-2 space-y-1">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="text-sm text-gray-600 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{item.label}</span>
                          {item.type === 'select' && (
                            <span className="ml-2 text-xs text-gray-400">
                              ({item.options.join(', ')})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}