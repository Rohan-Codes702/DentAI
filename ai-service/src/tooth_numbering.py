def assign_tooth_number(box, image_width):

    x1, y1, x2, y2 = box

    center_x = (x1 + x2) / 2

    tooth_width = image_width / 32

    tooth_number = int(center_x / tooth_width) + 1

    return tooth_number