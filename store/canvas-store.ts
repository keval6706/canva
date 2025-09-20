import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { CanvasElement, CanvasState, Tool, Point, HistoryAction, GroupElement } from '../types/canvas';

interface CanvasStore extends CanvasState {
  // Element management
  addElement: (element: Omit<CanvasElement, 'id' | 'zIndex'>) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  deleteElements: (ids: string[]) => void;
  duplicateElement: (id: string) => void;
  duplicateElements: (ids: string[]) => void;
  
  // Selection
  selectElement: (id: string) => void;
  selectElements: (ids: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Layer management
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  moveElementToTop: (id: string) => void;
  moveElementToBottom: (id: string) => void;
  
  // Grouping
  groupElements: (ids: string[]) => void;
  ungroupElements: (groupId: string) => void;
  createGroup: (elementIds: string[], groupName?: string) => string;
  dissolveGroup: (groupId: string) => void;
  
  // Clipboard
  copyElements: (ids?: string[]) => void;
  cutElements: (ids?: string[]) => void;
  pasteElements: () => void;
  
  // History
  undo: () => void;
  redo: () => void;
  pushToHistory: (action: HistoryAction) => void;
  
  // Canvas operations
  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
  setCanvasSize: (width: number, height: number) => void;
  
  // Tools
  setTool: (tool: Tool) => void;
  
  // Grid and guides
  toggleGrid: () => void;
  toggleGridSnap: () => void;
  toggleGuides: () => void;
  toggleGuidesSnap: () => void;
  toggleRulers: () => void;
  
  // Utility functions
  getElementById: (id: string) => CanvasElement | undefined;
  getSelectedElements: () => CanvasElement[];
  getNextZIndex: () => number;
  getElementsBounds: (elementIds: string[]) => { x: number; y: number; width: number; height: number };
  getElementBounds: (element: CanvasElement) => { x: number; y: number; width: number; height: number };
}

const initialState: CanvasState = {
  width: 800,
  height: 600,
  zoom: 1,
  pan: { x: 0, y: 0 },
  elements: [],
  selectedIds: [],
  clipboard: [],
  history: {
    past: [],
    present: [],
    future: []
  },
  grid: {
    enabled: false,
    size: 20,
    snap: true
  },
  guides: {
    enabled: true,
    snap: true
  },
  rulers: {
    enabled: false
  },
  tool: 'select',
  mode: 'design'
};

export const useCanvasStore = create<CanvasStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Element management
    addElement: (elementData) => {
      const element: CanvasElement = {
        ...elementData,
        id: uuidv4(),
        zIndex: get().getNextZIndex()
      } as CanvasElement;

      set((state) => {
        const _elements = [...state.elements, element];
        return {
          elements: _elements,
          selectedIds: [element.id],
          history: {
            ...state.history,
            present: _elements,
            past: [...state.history.past, state.elements],
            future: []
          }
        };
      });
    },

    updateElement: (id, updates) => {
      set((state) => {
        const _index = state.elements.findIndex(el => el.id === id);
        if (_index === -1) return state;

        const _elements = [...state.elements];
        _elements[_index] = { ..._elements[_index], ...updates } as CanvasElement;

        // If element is being hidden, remove it from selection
        let selectedIds = state.selectedIds;
        if (updates.visible === false && state.selectedIds.includes(id)) {
          selectedIds = state.selectedIds.filter(selectedId => selectedId !== id);
        }

        return {
          elements: _elements,
          selectedIds: selectedIds,
          history: {
            ...state.history,
            present: _elements,
            past: [...state.history.past, state.elements],
            future: []
          }
        };
      });
    },

    deleteElement: (id) => {
      set((state) => {
        const _elements = state.elements.filter(el => el.id !== id);
        const selectedIds = state.selectedIds.filter(selectedId => selectedId !== id);

        return {
          elements: _elements,
          selectedIds: selectedIds,
          history: {
            ...state.history,
            present: _elements,
            past: [...state.history.past, state.elements],
            future: []
          }
        };
      });
    },

    deleteElements: (ids) => {
      set((state) => {
        const _elements = state.elements.filter(el => !ids.includes(el.id));
        const selectedIds = state.selectedIds.filter(selectedId => !ids.includes(selectedId));

        return {
          elements: _elements,
          selectedIds: selectedIds,
          history: {
            ...state.history,
            present: _elements,
            past: [...state.history.past, state.elements],
            future: []
          }
        };
      });
    },

    duplicateElement: (id) => {
      const element = get().getElementById(id);
      if (!element) return;

      const duplicated: CanvasElement = {
        ...element,
        id: uuidv4(),
        name: `${element.name} Copy`,
        transform: {
          ...element.transform,
          x: element.transform.x + 20,
          y: element.transform.y + 20
        },
        zIndex: get().getNextZIndex()
      };

      set((state) => {
        const _elements = [...state.elements, duplicated];
        return {
          elements: _elements,
          selectedIds: [duplicated.id],
          history: {
            ...state.history,
            present: _elements,
            past: [...state.history.past, state.elements],
            future: []
          }
        };
      });
    },

    duplicateElements: (ids) => {
      const elements = ids.map(id => get().getElementById(id)).filter(Boolean) as CanvasElement[];
      if (elements.length === 0) return;

      const duplicated = elements.map(element => ({
        ...element,
        id: uuidv4(),
        name: `${element.name} Copy`,
        transform: {
          ...element.transform,
          x: element.transform.x + 20,
          y: element.transform.y + 20
        },
        zIndex: get().getNextZIndex()
      }));

      set((state) => {
        const _elements = [...state.elements, ...duplicated];
        return {
          elements: _elements,
          selectedIds: duplicated.length > 0 ? [duplicated[0].id] : [], // Only select the first duplicated element
          history: {
            ...state.history,
            present: _elements,
            past: [...state.history.past, state.elements],
            future: []
          }
        };
      });
    },

    // Selection
    selectElement: (id) => {
      set({ selectedIds: [id] });
    },

    selectElements: (ids) => {
      set({ selectedIds: ids });
    },

    clearSelection: () => {
      set({ selectedIds: [] });
    },

    selectAll: () => {
      set((state) => ({ 
        selectedIds: state.elements
          .filter(el => el.groupId === undefined) // Only select elements that are not children of groups
          .map(el => el.id) 
      }));
    },

    // Layer management
    moveElementUp: (id) => {
      set((state) => {
        const element = state.elements.find(el => el.id === id);
        if (!element) return state;

        const _elements = state.elements.map(el => {
          if (el.id === id) return { ...el, zIndex: el.zIndex + 1 };
          if (el.zIndex === element.zIndex + 1) return { ...el, zIndex: el.zIndex - 1 };
          return el;
        });

        return { elements: _elements };
      });
    },

    moveElementDown: (id) => {
      set((state) => {
        const element = state.elements.find(el => el.id === id);
        if (!element || element.zIndex === 0) return state;

        const _elements = state.elements.map(el => {
          if (el.id === id) return { ...el, zIndex: el.zIndex - 1 };
          if (el.zIndex === element.zIndex - 1) return { ...el, zIndex: el.zIndex + 1 };
          return el;
        });

        return { elements: _elements };
      });
    },

    moveElementToTop: (id) => {
      const maxZIndex = get().getNextZIndex() - 1;
      get().updateElement(id, { zIndex: maxZIndex });
    },

    moveElementToBottom: (id) => {
      get().updateElement(id, { zIndex: 0 });
      // Adjust other elements
      set((state) => {
        const _elements = state.elements.map(el => 
          el.id !== id ? { ...el, zIndex: el.zIndex + 1 } : el
        );
        return { elements: _elements };
      });
    },

    // Grouping
    groupElements: (ids) => {
      if (ids.length < 2) return;
      get().createGroup(ids);
    },

    ungroupElements: (groupId) => {
      get().dissolveGroup(groupId);
    },

    createGroup: (elementIds, groupName) => {
      const elements = elementIds.map(id => get().getElementById(id)).filter(Boolean) as CanvasElement[];
      if (elements.length < 2) return '';

      // Calculate group bounds
      const bounds = get().getElementsBounds(elementIds);
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;

      // Create group element
      const groupElement: Omit<GroupElement, 'id' | 'zIndex'> = {
        type: 'group',
        name: groupName || 'Group',
        visible: true,
        locked: false,
        opacity: 1,
        transform: {
          x: centerX,
          y: centerY,
          scaleX: 1,
          scaleY: 1,
          rotation: 0
        },
        children: elementIds
      };

      // Add group element
      const groupId = uuidv4();
      const group: GroupElement = {
        ...groupElement,
        id: groupId,
        zIndex: get().getNextZIndex()
      };

      // Update child elements to be relative to group center
      const updatedChildElements = elements.map(el => ({
        ...el,
        transform: {
          ...el.transform,
          x: el.transform.x - centerX,
          y: el.transform.y - centerY,
          scaleX: el.transform.scaleX,
          scaleY: el.transform.scaleY,
          rotation: el.transform.rotation
        },
        groupId: groupId
      }));

      // Remove child elements from main elements array and add group
      const elementsWithoutChildren = get().elements.filter(el => !elementIds.includes(el.id));

      set((state) => ({
        elements: [...elementsWithoutChildren, ...updatedChildElements, group] as CanvasElement[],
        selectedIds: [groupId],
        history: {
          ...state.history,
          present: [...elementsWithoutChildren, ...updatedChildElements, group] as CanvasElement[],
          past: [...state.history.past, state.elements],
          future: []
        }
      }));

      return groupId;
    },

    dissolveGroup: (groupId) => {
      const group = get().getElementById(groupId) as GroupElement;
      if (!group || group.type !== 'group') return;

      // Get child elements
      const childElements = group.children.map(id => get().getElementById(id)).filter(Boolean) as CanvasElement[];

      // Transform child elements back to world coordinates
      const updatedChildElements = childElements.map(child => ({
        ...child,
        transform: {
          ...child.transform,
          x: child.transform.x + group.transform.x,
          y: child.transform.y + group.transform.y,
          scaleX: child.transform.scaleX * group.transform.scaleX,
          scaleY: child.transform.scaleY * group.transform.scaleY,
          rotation: child.transform.rotation + group.transform.rotation
        },
        groupId: undefined
      }));

      // Remove group and update children
      const elementsWithoutGroup = get().elements.filter(el => el.id !== groupId);
      const finalElements = elementsWithoutGroup.map(el => {
        const updatedChild = updatedChildElements.find(child => child.id === el.id);
        return updatedChild || el;
      });

      set((state) => ({
        elements: finalElements,
        selectedIds: group.children,
        history: {
          ...state.history,
          present: finalElements,
          past: [...state.history.past, state.elements],
          future: []
        }
      }));
    },

    // Clipboard
    copyElements: (ids) => {
      const targetIds = ids || get().selectedIds;
      const elements = targetIds.map(id => get().getElementById(id)).filter(Boolean) as CanvasElement[];
      set({ clipboard: elements });
    },

    cutElements: (ids) => {
      const targetIds = ids || get().selectedIds;
      get().copyElements(targetIds);
      get().deleteElements(targetIds);
    },

    pasteElements: () => {
      const { clipboard } = get();
      if (clipboard.length === 0) return;

      const duplicated = clipboard.map(element => ({
        ...element,
        id: uuidv4(),
        transform: {
          ...element.transform,
          x: element.transform.x + 20,
          y: element.transform.y + 20
        },
        zIndex: get().getNextZIndex()
      }));

      set((state) => {
        const _elements = [...state.elements, ...duplicated];
        return {
          elements: _elements,
          selectedIds: duplicated.length > 0 ? [duplicated[0].id] : [], // Only select the first pasted element
          history: {
            ...state.history,
            present: _elements,
            past: [...state.history.past, state.elements],
            future: []
          }
        };
      });
    },

    // History
    undo: () => {
      set((state) => {
        if (state.history.past.length === 0) return state;

        const previous = state.history.past[state.history.past.length - 1];
        const newPast = state.history.past.slice(0, state.history.past.length - 1);

        return {
          elements: previous,
          history: {
            past: newPast,
            present: previous,
            future: [state.elements, ...state.history.future]
          }
        };
      });
    },

    redo: () => {
      set((state) => {
        if (state.history.future.length === 0) return state;

        const next = state.history.future[0];
        const newFuture = state.history.future.slice(1);

        return {
          elements: next,
          history: {
            past: [...state.history.past, state.elements],
            present: next,
            future: newFuture
          }
        };
      });
    },

    pushToHistory: (action) => {
      // This can be expanded for more granular history tracking
      set((state) => ({
        history: {
          ...state.history,
          past: [...state.history.past, state.elements],
          future: []
        }
      }));
    },

    // Canvas operations
    setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

    setPan: (pan) => set({ pan }),

    setCanvasSize: (width, height) => {
      set((state) => {
        // Calculate zoom to fit canvas in viewport with padding
        // Use more realistic viewport estimates based on common screen sizes
        const viewportWidth = 1400; // Account for sidebars and padding
        const viewportHeight = 900; // Account for toolbar and padding
        const padding = 80; // Generous padding around canvas

        const availableWidth = viewportWidth - padding;
        const availableHeight = viewportHeight - padding;

        const scaleX = availableWidth / width;
        const scaleY = availableHeight / height;
        const fitZoom = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

        // Ensure minimum zoom level for usability
        const minZoom = 0.1;
        const finalZoom = Math.max(minZoom, fitZoom);

        return {
          width,
          height,
          zoom: finalZoom,
          pan: { x: 0, y: 0 } // Reset pan, let Canvas component center it
        };
      });
    },

    // Tools
    setTool: (tool) => set({ tool }),

    // Grid and guides
    toggleGrid: () => set((state) => ({ 
      grid: { ...state.grid, enabled: !state.grid.enabled } 
    })),

    toggleGridSnap: () => set((state) => ({ 
      grid: { ...state.grid, snap: !state.grid.snap } 
    })),

    toggleGuides: () => set((state) => ({ 
      guides: { ...state.guides, enabled: !state.guides.enabled } 
    })),

    toggleGuidesSnap: () => set((state) => ({ 
      guides: { ...state.guides, snap: !state.guides.snap } 
    })),

    toggleRulers: () => set((state) => ({ 
      rulers: { ...state.rulers, enabled: !state.rulers.enabled } 
    })),

    // Utility functions
    getElementById: (id) => {
      return get().elements.find(el => el.id === id);
    },

    getSelectedElements: () => {
      const { elements, selectedIds } = get();
      return selectedIds.map(id => elements.find(el => el.id === id)).filter(Boolean) as CanvasElement[];
    },

    getNextZIndex: () => {
      const { elements } = get();
      return elements.length > 0 ? Math.max(...elements.map(el => el.zIndex)) + 1 : 0;
    },

    getElementsBounds: (elementIds) => {
      const { elements } = get();
      const selectedElements = elements.filter(el => elementIds.includes(el.id));
      
      if (selectedElements.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
      }

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      selectedElements.forEach(element => {
        const bounds = get().getElementBounds(element);
        minX = Math.min(minX, bounds.x);
        minY = Math.min(minY, bounds.y);
        maxX = Math.max(maxX, bounds.x + bounds.width);
        maxY = Math.max(maxY, bounds.y + bounds.height);
      });

      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
    },

    getElementBounds: (element) => {
      // This is a simplified bounds calculation - in a real implementation
      // you'd need to calculate based on the actual rendered size
      const padding = 10;
      return {
        x: element.transform.x - padding,
        y: element.transform.y - padding,
        width: 100, // Default width - should be calculated based on content
        height: 50  // Default height - should be calculated based on content
      };
    }
  }))
);

// Subscribe to store changes for autosave
useCanvasStore.subscribe(
  (state) => state.elements,
  (elements) => {
    // Autosave to localStorage
    localStorage.setItem('canvas-autosave', JSON.stringify(elements));
  }
);