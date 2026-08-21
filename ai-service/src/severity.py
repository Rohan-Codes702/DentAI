def calculate_area(box):

    x1, y1, x2, y2 = box
    return (x2 - x1) * (y2 - y1)


def get_severity(area, confidence):

    if area < 5000 and confidence < 0.7:
        return "Mild"

    elif area < 15000:
        return "Moderate"

    else:
        return "Severe"