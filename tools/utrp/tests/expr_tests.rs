use utrp::expr::Expr;

#[test]
fn parses_and_renders_basic_math() {
    let expr = Expr::parse("sin(siner / 7.5) * -3").unwrap();

    assert_eq!(expr.to_gml(), "sin(siner / 7.5) * -3.0");
    assert_eq!(expr.to_js(), "Math.sin(vars.siner / 7.5) * -3.0");
}

#[test]
fn parses_existing_frame_index_expression_subset() {
    let expr = Expr::parse("floor(clamp(siner % 51 - 40, 0, 2))").unwrap();

    assert_eq!(expr.to_gml(), "floor(clamp(siner % 51.0 - 40.0, 0.0, 2.0))");
}
