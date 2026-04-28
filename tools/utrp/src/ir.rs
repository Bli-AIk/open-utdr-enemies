use crate::expr::Expr;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct RenderProgram {
    pub format: String,
    pub version: u32,
    pub slug: String,
    pub name: String,
    pub fps: u32,
    pub canvas: CanvasDef,
    pub coordinate_space: CoordinateSpace,
    pub review: ReviewInfo,
    pub variables: Vec<VariableDef>,
    pub assets: Vec<SpriteAsset>,
    pub update: Vec<UpdateOp>,
    pub draw: Vec<DrawOp>,
    pub codegen: BTreeMap<String, String>,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct ReviewInfo {
    pub accuracy: ReviewAccuracy,
    pub notes: Vec<String>,
}

impl ReviewInfo {
    pub fn needs_source_review(note: impl Into<String>) -> Self {
        Self {
            accuracy: ReviewAccuracy::NeedsSourceReview,
            notes: vec![note.into()],
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ReviewAccuracy {
    NeedsSourceReview,
    Reviewed,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct CanvasDef {
    pub width: u32,
    pub height: u32,
    pub scale: f64,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct Vec2 {
    pub x: f64,
    pub y: f64,
}

impl Vec2 {
    pub fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct CoordinateSpace {
    pub origin: CoordinateOrigin,
    pub y_axis: YAxis,
    pub rotation: RotationDirection,
    pub angle_unit: AngleUnit,
}

impl CoordinateSpace {
    pub fn gms() -> Self {
        Self {
            origin: CoordinateOrigin::TopLeft,
            y_axis: YAxis::Down,
            rotation: RotationDirection::CounterClockwise,
            angle_unit: AngleUnit::Degrees,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum CoordinateOrigin {
    TopLeft,
    Center,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum YAxis {
    Up,
    Down,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum RotationDirection {
    Clockwise,
    CounterClockwise,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum AngleUnit {
    Degrees,
    Radians,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct VariableDef {
    pub name: String,
    pub kind: VariableKind,
    pub initial: f64,
}

impl VariableDef {
    pub fn counter(name: impl Into<String>, initial: f64) -> Self {
        Self {
            name: name.into(),
            kind: VariableKind::Counter,
            initial,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum VariableKind {
    Counter,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct SpriteAsset {
    pub id: String,
    pub path: String,
    pub frames: Vec<String>,
}

impl SpriteAsset {
    pub fn single(id: impl Into<String>, path: impl Into<String>) -> Self {
        let path = path.into();
        Self {
            id: id.into(),
            path: path.clone(),
            frames: vec![path],
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(tag = "op")]
#[serde(rename_all = "snake_case")]
pub enum UpdateOp {
    Increment { variable: String, by: Expr },
}

impl UpdateOp {
    pub fn increment(variable: impl Into<String>, by: Expr) -> Self {
        Self::Increment {
            variable: variable.into(),
            by,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(tag = "kind")]
#[serde(rename_all = "snake_case")]
pub enum DrawOp {
    Sprite(SpriteDraw),
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct SpriteDraw {
    pub id: String,
    pub sprite: String,
    pub origin: Vec2,
    pub pivot: Option<Vec2>,
    pub transform: TransformExpr,
    pub draw_order: i32,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
pub struct TransformExpr {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub position: Option<Vec2>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "rotation_deg")]
    pub rotation_deg: Option<Expr>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scale: Option<Vec2>,
}
