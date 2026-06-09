import { BaseShape } from './BaseShape'
import { RectShape, CircleShape, EllipseShape, LineShape, CurveShape, ArrowShape, TextShape, PolygonShape, GroupShape } from './primitives'
import { GridShape, ArrayBarShape, StackShape, LinkedListShape, BinaryTreeShape, GraphShape, CoordinatePlaneShape } from './cs'
import type { ShapeType } from '../../constants'

const REGISTRY: Record<string, new (options: any) => BaseShape> = {
  rect: RectShape,
  circle: CircleShape,
  ellipse: EllipseShape,
  line: LineShape,
  curve: CurveShape,
  arrow: ArrowShape,
  text: TextShape,
  polygon: PolygonShape,
  group: GroupShape,
  grid: GridShape,
  arrayBar: ArrayBarShape,
  stack: StackShape,
  linkedList: LinkedListShape,
  binaryTree: BinaryTreeShape,
  graph: GraphShape,
  coordinatePlane: CoordinatePlaneShape,
}

export class ShapeFactory {
  static createShape(type: ShapeType | string, options: Partial<BaseShape> & { name: string }): BaseShape {
    const Ctor = REGISTRY[type]
    if (!Ctor) {
      throw new Error(`Unknown shape type: ${type}`)
    }
    return new Ctor(options)
  }

  static register(type: string, ctor: new (options: any) => BaseShape): void {
    REGISTRY[type] = ctor
  }

  static getRegisteredTypes(): string[] {
    return Object.keys(REGISTRY)
  }
}
