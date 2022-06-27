import { processAssignNames } from '../utils/serializedStateProcessing';
import BlockComponent from './abstract/BlockComponent';

export default class Graph extends BlockComponent {
  static componentType = "graph";
  static renderChildren = true;

  static createAttributesObject() {
    let attributes = super.createAttributesObject();
    attributes.xmin = {
      createComponentOfType: "number",
      createStateVariable: "xminPrelim",
      defaultValue: -10,
    };
    attributes.xmax = {
      createComponentOfType: "number",
      createStateVariable: "xmaxPrelim",
      defaultValue: 10,
    };
    attributes.ymin = {
      createComponentOfType: "number",
      createStateVariable: "yminPrelim",
      defaultValue: -10,
    };
    attributes.ymax = {
      createComponentOfType: "number",
      createStateVariable: "ymaxPrelim",
      defaultValue: 10,
    };
    attributes.width = {
      createComponentOfType: "_componentSize",
      createStateVariable: "width",
      defaultValue: { size: 300, isAbsolute: true },
      public: true,
      forRenderer: true,
    };
    attributes.aspectRatio = {
      createComponentOfType: "number",
    };
    attributes.height = {
      createComponentOfType: "_componentSize",
    };
    attributes.identicalAxisScales = {
      createPrimitiveOfType: "boolean",
      createStateVariable: "identicalAxisScales",
      defaultValue: false,
      public: true,
    };
    attributes.displayXAxis = {
      createComponentOfType: "boolean",
      createStateVariable: "displayXAxis",
      defaultValue: true,
      public: true,
      forRenderer: true
    };
    attributes.displayYAxis = {
      createComponentOfType: "boolean",
      createStateVariable: "displayYAxis",
      defaultValue: true,
      public: true,
      forRenderer: true
    };
    attributes.displayXAxisTickLabels = {
      createComponentOfType: "boolean",
      createStateVariable: "displayXAxisTickLabels",
      defaultValue: true,
      public: true,
      forRenderer: true
    };
    attributes.displayYAxisTickLabels = {
      createComponentOfType: "boolean",
      createStateVariable: "displayYAxisTickLabels",
      defaultValue: true,
      public: true,
      forRenderer: true
    };
    attributes.xlabel = {
      createComponentOfType: "text",
      createStateVariable: "xlabel",
      defaultValue: "",
      public: true,
      forRenderer: true
    };
    attributes.xlabelPosition = {
      createComponentOfType: "text",
      createStateVariable: "xlabelPosition",
      defaultValue: "right",
      public: true,
      forRenderer: true,
      toLowerCase: true,
      validValues: ["right", "left"]
    };
    attributes.xTickScaleFactor = {
      createComponentOfType: "math",
      createStateVariable: "xTickScaleFactor",
      defaultValue: null,
      public: true,
      forRenderer: true,
    }
    attributes.ylabel = {
      createComponentOfType: "text",
      createStateVariable: "ylabel",
      defaultValue: "",
      public: true,
      forRenderer: true
    };
    attributes.ylabelPosition = {
      createComponentOfType: "text",
      createStateVariable: "ylabelPosition",
      defaultValue: "top",
      public: true,
      forRenderer: true,
      toLowerCase: true,
      validValues: ["top", "bottom"]
    };
    attributes.ylabelAlignment = {
      createComponentOfType: "text",
      createStateVariable: "ylabelAlignment",
      defaultValue: "left",
      public: true,
      forRenderer: true,
      toLowerCase: true,
      validValues: ["left", "right"]
    };
    attributes.yTickScaleFactor = {
      createComponentOfType: "math",
      createStateVariable: "yTickScaleFactor",
      defaultValue: null,
      public: true,
      forRenderer: true,
    }
    attributes.showNavigation = {
      createComponentOfType: "boolean",
      createStateVariable: "showNavigation",
      defaultValue: true,
      public: true,
      forRenderer: true
    };
    attributes.fixAxes = {
      createComponentOfType: "boolean",
      createStateVariable: "fixAxes",
      defaultValue: false,
      public: true,
      forRenderer: true
    };
    attributes.grid = {
      createComponentOfType: "text",
      createStateVariable: "grid",
      defaultValue: "none",
      public: true,
      forRenderer: true,
      toLowerCase: true,
      valueTransformations: { "true": "medium", "false": "none" },
      validValues: ["none", "medium", "dense"]
    };
    return attributes;
  }


  // static returnSugarInstructions() {
  //   let sugarInstructions = super.returnSugarInstructions();

  //   let addCurve = function ({ matchedChildren }) {
  //     // add <curve> around strings and macros, 
  //     //as long as they don't have commas (for points)


  //     // only apply if all children are strings without commas or macros
  //     if (!matchedChildren.every(child =>
  //       child.componentType === "string" && !child.state.value.includes(",") ||
  //       child.doenetAttributes && child.doenetAttributes.createdFromMacro
  //     )) {
  //       return { success: false }
  //     }

  //     return {
  //       success: true,
  //       newChildren: [{ componentType: "curve", children: matchedChildren }],
  //     }
  //   }

  //   sugarInstructions.push({
  //     replacementFunction: addCurve
  //   });

  //   return sugarInstructions;

  // }


  static returnChildGroups() {

    return [{
      group: "graphical",
      componentTypes: ["_graphical"]
    }]

  }

  static returnStateVariableDefinitions() {

    let stateVariableDefinitions = super.returnStateVariableDefinitions();

    stateVariableDefinitions.graphicalDescendants = {
      forRenderer: true,
      returnDependencies: () => ({
        graphicalDescendants: {
          dependencyType: "descendant",
          componentTypes: ["_graphical"],
          variableNames: ["selectedStyle", "styleNumber"]
        },
      }),
      definition: function ({ dependencyValues }) {
        return {
          setValue: {
            graphicalDescendants: dependencyValues.graphicalDescendants
          }
        }
      },
    };

    stateVariableDefinitions.nChildrenAdded = {
      defaultValue: 0,
      hasEssential: true,
      returnDependencies: () => ({}),
      definition: () => ({ useEssentialOrDefaultValue: { nChildrenAdded: true } }),
      inverseDefinition({ desiredStateVariableValues }) {
        return {
          success: true,
          instructions: [{
            setEssentialValue: "nChildrenAdded",
            value: desiredStateVariableValues.nChildrenAdded
          }]
        }
      }
    }

    stateVariableDefinitions.aspectRatioFromAxisScales = {
      returnDependencies: () => ({
        aspectRatioAttr: {
          dependencyType: "attributeComponent",
          attributeName: "aspectRatio",
          variableNames: ["value"]
        },
        identicalAxisScales: {
          dependencyType: "stateVariable",
          variableName: "identicalAxisScales"
        },
        heightAttr: {
          dependencyType: "attributeComponent",
          attributeName: "height",
          variableNames: ["componentSize"]
        },

      }),
      definition({ dependencyValues }) {
        if (dependencyValues.heightAttr !== null) {
          console.warn("Height attribute of graph is deprecated and is being ignored.  Use aspectRatio attribute instead.")
        }

        let aspectRatioFromAxisScales = dependencyValues.identicalAxisScales
          && (dependencyValues.aspectRatioAttr === null
            // || !Number.isFinite(dependencyValues.aspectRatioAttr.stateValues.value)
          );

        return {
          setValue: { aspectRatioFromAxisScales },
          checkForActualChange: { aspectRatioFromAxisScales: true }
        }
      }
    }

    stateVariableDefinitions.aspectRatio = {
      public: true,
      forRenderer: true,
      defaultValue: 1,
      hasEssential: true,
      shadowingInstructions: {
        createComponentOfType: "number"
      },
      stateVariablesDeterminingDependencies: ["aspectRatioFromAxisScales"],
      returnDependencies({ stateValues }) {
        if (stateValues.aspectRatioFromAxisScales) {
          return {
            aspectRatioFromAxisScales: {
              dependencyType: "stateVariable",
              variableName: "aspectRatioFromAxisScales"
            },
            xscale: {
              dependencyType: "stateVariable",
              variableName: "xscale"
            },
            yscale: {
              dependencyType: "stateVariable",
              variableName: "yscale"
            }
          }
        } else {
          return {
            aspectRatioFromAxisScales: {
              dependencyType: "stateVariable",
              variableName: "aspectRatioFromAxisScales"
            },
            aspectRatioAttr: {
              dependencyType: "attributeComponent",
              attributeName: "aspectRatio",
              variableNames: ["value"]
            },
            width: {
              dependencyType: "stateVariable",
              variableName: "width"
            }
          }
        }
      },
      definition({ dependencyValues }) {
        if (dependencyValues.aspectRatioFromAxisScales) {
          let aspectRatio = dependencyValues.xscale / dependencyValues.yscale;
          return {
            setValue: { aspectRatio }
          }
        } else if (dependencyValues.aspectRatioAttr !== null) {
          let aspectRatio = dependencyValues.aspectRatioAttr.stateValues.value;
          if (!Number.isFinite(aspectRatio)) {
            aspectRatio = 1;
          }
          return {
            setValue: { aspectRatio }
          }
        } else {
          return {
            useEssentialOrDefaultValue: { aspectRatio: true }
          }
        }
      }
    }

    stateVariableDefinitions.xmin = {
      stateVariablesDeterminingDependencies: ["identicalAxisScales", "aspectRatioFromAxisScales"],
      defaultValue: -10,
      public: true,
      shadowingInstructions: {
        createComponentOfType: "number",
      },
      forRenderer: true,
      returnDependencies({ stateValues }) {
        let dependencies = {
          identicalAxisScales: {
            dependencyType: "stateVariable",
            variableName: "identicalAxisScales"
          },
          aspectRatioFromAxisScales: {
            dependencyType: "stateVariable",
            variableName: "aspectRatioFromAxisScales"
          },
          xminPrelim: {
            dependencyType: "stateVariable",
            variableName: "xminPrelim"
          }
        }

        if (stateValues.identicalAxisScales && !stateValues.aspectRatioFromAxisScales) {
          dependencies.xmaxPrelim = {
            dependencyType: "stateVariable",
            variableName: "xmaxPrelim"
          }
          dependencies.yminPrelim = {
            dependencyType: "stateVariable",
            variableName: "yminPrelim"
          }
          dependencies.ymaxPrelim = {
            dependencyType: "stateVariable",
            variableName: "ymaxPrelim"
          }
          dependencies.aspectRatio = {
            dependencyType: "stateVariable",
            variableName: "aspectRatio"
          }
        }
        return dependencies;
      },
      definition({ dependencyValues, usedDefault }) {
        if (!dependencyValues.identicalAxisScales || dependencyValues.aspectRatioFromAxisScales) {
          return { setValue: { xmin: dependencyValues.xminPrelim } }
        }

        let xminSpecified = !usedDefault.xminPrelim;

        // always use xmin if specified
        if (xminSpecified) {
          return { setValue: { xmin: dependencyValues.xminPrelim } }
        }

        let xmaxSpecified = !usedDefault.xmaxPrelim;
        let yminSpecified = !usedDefault.yminPrelim;
        let ymaxSpecified = !usedDefault.ymaxPrelim;

        let yscaleSpecified = yminSpecified && ymaxSpecified;

        if (yscaleSpecified) {
          let aspectRatio = dependencyValues.aspectRatio;
          let yscaleAdjusted = (dependencyValues.ymaxPrelim - dependencyValues.yminPrelim) * aspectRatio;
          if (xmaxSpecified) {
            return { setValue: { xmin: dependencyValues.xmaxPrelim - yscaleAdjusted } };
          } else {
            return { setValue: { xmin: -yscaleAdjusted / 2 } };
          }
        } else {
          if (xmaxSpecified) {
            // use the default xscale of 20
            return { setValue: { xmin: dependencyValues.xmaxPrelim - 20 } };
          } else {
            // use the default value of xmin
            return { setValue: { xmin: -10 } }
          }
        }

      },
      async inverseDefinition({ desiredStateVariableValues, stateValues }) {
        if (await stateValues.fixAxes) {
          return { success: false }
        }
        return {
          success: true,
          instructions: [{
            setDependency: "xminPrelim",
            desiredValue: desiredStateVariableValues.xmin
          }]
        }
      }
    }

    stateVariableDefinitions.xmax = {
      stateVariablesDeterminingDependencies: ["identicalAxisScales", "aspectRatioFromAxisScales"],
      defaultValue: -10,
      public: true,
      shadowingInstructions: {
        createComponentOfType: "number",
      },
      forRenderer: true,
      returnDependencies({ stateValues }) {
        let dependencies = {
          identicalAxisScales: {
            dependencyType: "stateVariable",
            variableName: "identicalAxisScales"
          },
          aspectRatioFromAxisScales: {
            dependencyType: "stateVariable",
            variableName: "aspectRatioFromAxisScales"
          },
          xmaxPrelim: {
            dependencyType: "stateVariable",
            variableName: "xmaxPrelim"
          }
        }

        if (stateValues.identicalAxisScales && !stateValues.aspectRatioFromAxisScales) {
          dependencies.xminPrelim = {
            dependencyType: "stateVariable",
            variableName: "xminPrelim"
          }
          dependencies.yminPrelim = {
            dependencyType: "stateVariable",
            variableName: "yminPrelim"
          }
          dependencies.ymaxPrelim = {
            dependencyType: "stateVariable",
            variableName: "ymaxPrelim"
          }
          dependencies.aspectRatio = {
            dependencyType: "stateVariable",
            variableName: "aspectRatio"
          }
        }
        return dependencies;
      },
      definition({ dependencyValues, usedDefault }) {
        if (!dependencyValues.identicalAxisScales || dependencyValues.aspectRatioFromAxisScales) {
          return { setValue: { xmax: dependencyValues.xmaxPrelim } }
        }

        let xminSpecified = !usedDefault.xminPrelim;
        let xmaxSpecified = !usedDefault.xmaxPrelim;
        let yminSpecified = !usedDefault.yminPrelim;
        let ymaxSpecified = !usedDefault.ymaxPrelim;

        let yscaleSpecified = yminSpecified && ymaxSpecified;
        let xscaleSpecified = xminSpecified && xmaxSpecified;

        let xmin = dependencyValues.xminPrelim;

        if (yscaleSpecified) {
          let aspectRatio = dependencyValues.aspectRatio;
          let yscaleAdjusted = (dependencyValues.ymaxPrelim - dependencyValues.yminPrelim) * aspectRatio;

          if (xscaleSpecified) {
            let xscale = dependencyValues.xmaxPrelim - xmin;
            let maxScale = Math.max(xscale, yscaleAdjusted);

            return { setValue: { xmax: xmin + maxScale } };
          } else {
            if (xminSpecified) {
              return { setValue: { xmax: xmin + yscaleAdjusted } }
            } else if (xmaxSpecified) {
              return { setValue: { xmax: dependencyValues.xmaxPrelim } }
            } else {
              return { setValue: { xmax: yscaleAdjusted / 2 } };
            }

          }
        } else {
          // no yscale specified
          if (xmaxSpecified) {
            return { setValue: { xmax: dependencyValues.xmaxPrelim } }
          } else if (xminSpecified) {
            // use the default xscale of 20
            return { setValue: { xmax: xmin + 20 } }
          } else {
            // use the default xmax
            return { setValue: { xmax: 10 } }
          }
        }

      },
      async inverseDefinition({ desiredStateVariableValues, stateValues }) {
        if (await stateValues.fixAxes) {
          return { success: false }
        }
        return {
          success: true,
          instructions: [{
            setDependency: "xmaxPrelim",
            desiredValue: desiredStateVariableValues.xmax
          }]
        }
      }
    }


    stateVariableDefinitions.ymin = {
      stateVariablesDeterminingDependencies: ["identicalAxisScales", "aspectRatioFromAxisScales"],
      defaultValue: -10,
      public: true,
      shadowingInstructions: {
        createComponentOfType: "number",
      },
      forRenderer: true,
      returnDependencies({ stateValues }) {
        let dependencies = {
          identicalAxisScales: {
            dependencyType: "stateVariable",
            variableName: "identicalAxisScales"
          },
          aspectRatioFromAxisScales: {
            dependencyType: "stateVariable",
            variableName: "aspectRatioFromAxisScales"
          },
          yminPrelim: {
            dependencyType: "stateVariable",
            variableName: "yminPrelim"
          }
        }

        if (stateValues.identicalAxisScales && !stateValues.aspectRatioFromAxisScales) {
          dependencies.xmaxPrelim = {
            dependencyType: "stateVariable",
            variableName: "xmaxPrelim"
          }
          dependencies.xminPrelim = {
            dependencyType: "stateVariable",
            variableName: "xminPrelim"
          }
          dependencies.ymaxPrelim = {
            dependencyType: "stateVariable",
            variableName: "ymaxPrelim"
          }
          dependencies.aspectRatio = {
            dependencyType: "stateVariable",
            variableName: "aspectRatio"
          }
        }
        return dependencies;
      },
      definition({ dependencyValues, usedDefault }) {
        if (!dependencyValues.identicalAxisScales || dependencyValues.aspectRatioFromAxisScales) {
          return { setValue: { ymin: dependencyValues.yminPrelim } }
        }

        let yminSpecified = !usedDefault.yminPrelim;

        // always use ymin if specified
        if (yminSpecified) {
          return { setValue: { ymin: dependencyValues.yminPrelim } }
        }

        let ymaxSpecified = !usedDefault.ymaxPrelim;
        let xminSpecified = !usedDefault.xminPrelim;
        let xmaxSpecified = !usedDefault.xmaxPrelim;

        let xscaleSpecified = xminSpecified && xmaxSpecified;
        let aspectRatio = dependencyValues.aspectRatio;

        if (xscaleSpecified) {
          let xscaleAdjusted = (dependencyValues.xmaxPrelim - dependencyValues.xminPrelim) / aspectRatio;
          if (ymaxSpecified) {
            return { setValue: { ymin: dependencyValues.ymaxPrelim - xscaleAdjusted } };
          } else {
            return { setValue: { ymin: -xscaleAdjusted / 2 } };
          }
        } else {
          if (ymaxSpecified) {
            // use the default xscale of 20, adjusted for aspect ratio
            return { setValue: { ymin: dependencyValues.ymaxPrelim - 20 / aspectRatio } };
          } else {
            // use the default value of ymin, adjusted for aspect ration
            return { setValue: { ymin: -10 / aspectRatio } }
          }
        }

      },
      async inverseDefinition({ desiredStateVariableValues, stateValues }) {
        if (await stateValues.fixAxes) {
          return { success: false }
        }
        return {
          success: true,
          instructions: [{
            setDependency: "yminPrelim",
            desiredValue: desiredStateVariableValues.ymin
          }]
        }
      }
    }

    stateVariableDefinitions.ymax = {
      stateVariablesDeterminingDependencies: ["identicalAxisScales", "aspectRatioFromAxisScales"],
      defaultValue: -10,
      public: true,
      shadowingInstructions: {
        createComponentOfType: "number",
      },
      forRenderer: true,
      returnDependencies({ stateValues }) {
        let dependencies = {
          identicalAxisScales: {
            dependencyType: "stateVariable",
            variableName: "identicalAxisScales"
          },
          aspectRatioFromAxisScales: {
            dependencyType: "stateVariable",
            variableName: "aspectRatioFromAxisScales"
          },
          ymaxPrelim: {
            dependencyType: "stateVariable",
            variableName: "ymaxPrelim"
          }
        }

        if (stateValues.identicalAxisScales && !stateValues.aspectRatioFromAxisScales) {
          dependencies.xminPrelim = {
            dependencyType: "stateVariable",
            variableName: "xminPrelim"
          }
          dependencies.yminPrelim = {
            dependencyType: "stateVariable",
            variableName: "yminPrelim"
          }
          dependencies.xmaxPrelim = {
            dependencyType: "stateVariable",
            variableName: "xmaxPrelim"
          }
          dependencies.aspectRatio = {
            dependencyType: "stateVariable",
            variableName: "aspectRatio"
          }
        }
        return dependencies;
      },
      definition({ dependencyValues, usedDefault }) {
        if (!dependencyValues.identicalAxisScales || dependencyValues.aspectRatioFromAxisScales) {
          return { setValue: { ymax: dependencyValues.ymaxPrelim } }
        }

        let xminSpecified = !usedDefault.xminPrelim;
        let xmaxSpecified = !usedDefault.xmaxPrelim;
        let yminSpecified = !usedDefault.yminPrelim;
        let ymaxSpecified = !usedDefault.ymaxPrelim;

        let yscaleSpecified = yminSpecified && ymaxSpecified;
        let xscaleSpecified = xminSpecified && xmaxSpecified;

        let ymin = dependencyValues.yminPrelim;

        let aspectRatio = dependencyValues.aspectRatio;

        if (xscaleSpecified) {
          let xscaleAdjusted = (dependencyValues.xmaxPrelim - dependencyValues.xminPrelim) / aspectRatio;

          if (yscaleSpecified) {
            let yscale = dependencyValues.ymaxPrelim - ymin;
            let maxScale = Math.max(yscale, xscaleAdjusted);

            return { setValue: { ymax: ymin + maxScale } };
          } else {

            if (yminSpecified) {
              return { setValue: { ymax: ymin + xscaleAdjusted } }
            } else if (ymaxSpecified) {
              return { setValue: { ymax: dependencyValues.ymaxPrelim } }
            } else {
              return { setValue: { ymax: xscaleAdjusted / 2 } };
            }

          }
        } else {
          // no xscale specified
          if (ymaxSpecified) {
            return { setValue: { ymax: dependencyValues.ymaxPrelim } }
          } else if (yminSpecified) {
            // use the default yscale of 20, adjusted for aspect ratio
            return { setValue: { ymax: ymin + 20 / aspectRatio } }
          } else {
            // use the default ymax, adjusted for aspect ratio
            return { setValue: { ymax: 10 / aspectRatio } }
          }
        }


      },
      async inverseDefinition({ desiredStateVariableValues, stateValues }) {
        if (await stateValues.fixAxes) {
          return { success: false }
        }
        return {
          success: true,
          instructions: [{
            setDependency: "ymaxPrelim",
            desiredValue: desiredStateVariableValues.ymax
          }]
        }
      }
    }

    stateVariableDefinitions.xscale = {
      public: true,
      shadowingInstructions: {
        createComponentOfType: "number",
      },
      returnDependencies: () => ({
        xmin: {
          dependencyType: "stateVariable",
          variableName: "xmin"
        },
        xmax: {
          dependencyType: "stateVariable",
          variableName: "xmax"
        }
      }),
      definition({ dependencyValues }) {
        return {
          setValue: {
            xscale: dependencyValues.xmax - dependencyValues.xmin
          }
        }
      }
    }

    stateVariableDefinitions.yscale = {
      public: true,
      shadowingInstructions: {
        createComponentOfType: "number",
      },
      returnDependencies: () => ({
        ymin: {
          dependencyType: "stateVariable",
          variableName: "ymin"
        },
        ymax: {
          dependencyType: "stateVariable",
          variableName: "ymax"
        }
      }),
      definition({ dependencyValues }) {
        return {
          setValue: {
            yscale: dependencyValues.ymax - dependencyValues.ymin
          }
        }
      }
    }

    return stateVariableDefinitions;
  }

  async changeAxisLimits({ xmin, xmax, ymin, ymax, actionId }) {

    let updateInstructions = [];

    if (xmin !== undefined) {
      updateInstructions.push({
        updateType: "updateValue",
        componentName: this.componentName,
        stateVariable: "xmin",
        value: xmin
      })
    }
    if (xmax !== undefined) {
      updateInstructions.push({
        updateType: "updateValue",
        componentName: this.componentName,
        stateVariable: "xmax",
        value: xmax
      })
    }
    if (ymin !== undefined) {
      updateInstructions.push({
        updateType: "updateValue",
        componentName: this.componentName,
        stateVariable: "ymin",
        value: ymin
      })
    }
    if (ymax !== undefined) {
      updateInstructions.push({
        updateType: "updateValue",
        componentName: this.componentName,
        stateVariable: "ymax",
        value: ymax
      })
    }

    return await this.coreFunctions.performUpdate({
      updateInstructions,
      actionId,
      event: {
        verb: "interacted",
        object: {
          componentName: this.componentName,
          componentType: this.componentType,
        },
        result: {
          xmin, xmax, ymin, ymax
        }
      }
    });

  }

  async addChildren({ serializedComponents, actionId }) {

    if (serializedComponents && serializedComponents.length > 0) {

      let processResult = processAssignNames({
        serializedComponents,
        parentName: this.componentName,
        parentCreatesNewNamespace: this.attributes.newNamespace?.primitive,
        componentInfoObjects: this.componentInfoObjects,
        indOffset: await this.stateValues.nChildrenAdded
      });

      return await this.coreFunctions.performUpdate({
        updateInstructions: [{
          updateType: "addComponents",
          serializedComponents: processResult.serializedComponents,
          parentName: this.componentName,
          assignNamesOffset: await this.stateValues.nChildrenAdded,
        }, {
          updateType: "updateValue",
          componentName: this.componentName,
          stateVariable: "nChildrenAdded",
          value: await this.stateValues.nChildrenAdded + processResult.serializedComponents.length,
        }],
        actionId,
      });
    } else {
      this.coreFunctions.resolveAction({ actionId });
    }
  }

  async deleteChildren({ number, actionId }) {

    let numberToDelete = Math.min(number, await this.stateValues.nChildrenAdded);

    if (numberToDelete > 0) {
      let nChildren = this.definingChildren.length;
      let componentNamesToDelete = this.definingChildren
        .slice(nChildren - numberToDelete, nChildren)
        .map(x => x.componentName);

      return await this.coreFunctions.performUpdate({
        updateInstructions: [{
          updateType: "deleteComponents",
          componentNames: componentNamesToDelete
        }, {
          updateType: "updateValue",
          componentName: this.componentName,
          stateVariable: "nChildrenAdded",
          value: await this.stateValues.nChildrenAdded - numberToDelete,
        }],
        actionId
      });

    } else {
      this.coreFunctions.resolveAction({ actionId });
    }

  }

  actions = {
    changeAxisLimits: this.changeAxisLimits.bind(this),
    addChildren: this.addChildren.bind(this),
    deleteChildren: this.deleteChildren.bind(this)
  };

}
