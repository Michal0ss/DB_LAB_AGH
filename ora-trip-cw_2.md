# Oracle PL/Sql

widoki, funkcje, procedury, triggery

ćwiczenie 2

(kontynuacja ćwiczenia 1)

---

Imiona i nazwiska autorów : Jakub Turek, Michał Białas

---

<style>
  {
    font-size: 16pt;
  }
</style>

<style scoped>
 li, p {
    font-size: 14pt;
  }
</style>

<style scoped>
 pre {
    font-size: 10pt;
  }
</style>

# Zadanie 6

Zmiana struktury bazy danych. W tabeli `trip` należy dodać redundantne pole `no_available_places`. Dodanie redundantnego pola uprości kontrolę dostępnych miejsc (sprawdzenie liczby dostępnych miejsc), ale nieco skomplikuje procedury dodawania rezerwacji, zmiany statusu czy też zmiany maksymalnej liczby miejsc na wycieczki (potrzebna będzie dodatkowa aktualizacja w tabeli `trip`).

Należy przygotować polecenie/procedurę przeliczającą wartość pola `no_available_places` dla wszystkich wycieczek (do jednorazowego wykonania)

Obsługę pola `no_available_places` można zrealizować przy pomocy procedur lub triggerów

Należy zwrócić uwagę na spójność rozwiązania.

> UWAGA
> Należy stworzyć nowe wersje tych widoków/procedur/triggerów (np. dodając do nazwy dopisek 6 - od numeru zadania). Poprzednie wersje procedur należy pozostawić w celu umożliwienia weryfikacji ich poprawności.

- zmiana struktury tabeli

```sql
alter table trip add
    no_available_places int null
```

- polecenie przeliczające wartość `no_available_places`
  - należy wykonać operację "przeliczenia" liczby wolnych miejsc i aktualizacji pola `no_available_places`

# Zadanie 6 - rozwiązanie

```sql
create or replace procedure p_recalculate_no_available_places_6
as
begin
	update trip t
	set no_available_places = t.max_no_places - (
		select count(*)
		from reservation r
		where r.trip_id = t.trip_id
		  and r.status in ('N', 'P')
	);
end;
/


create or replace view vw_trip_6 as
select t.trip_id,
	   t.country,
	   t.trip_date,
	   t.trip_name,
	   t.max_no_places,
	   t.no_available_places as places_left
from trip t;

create or replace view vw_available_trip_6 as
	select * from vw_trip_6 where vw_trip_6.trip_date >= current_date and vw_trip_6.places_left > 0;

```

---

# Zadanie 6a - procedury

Obsługę pola `no_available_places` należy zrealizować przy pomocy procedur

- procedura dodająca rezerwację powinna aktualizować pole `no_available_places` w tabeli trip
- podobnie procedury odpowiedzialne za zmianę statusu oraz zmianę maksymalnej liczby miejsc na wycieczkę
- należy przygotować procedury oraz jeśli jest to potrzebne, zaktualizować triggery oraz widoki

> UWAGA
> Należy stworzyć nowe wersje tych widoków/procedur/triggerów (np. dodając do nazwy dopisek 6a - od numeru zadania). Poprzednie wersje procedur należy pozostawić w celu umożliwienia weryfikacji ich poprawności.

- może być potrzebne wyłączenie 'poprzednich wersji' triggerów

# Zadanie 6a - rozwiązanie

```sql

create or replace procedure p_recalculate_no_available_places_6a
as
begin
	update trip t
	set no_available_places = t.max_no_places - (
		select count(*)
		from reservation r
		where r.trip_id = t.trip_id
		  and r.status in ('N', 'P')
	);
end;
/


create or replace view vw_trip_6a as
select t.trip_id,
	   t.country,
	   t.trip_date,
	   t.trip_name,
	   t.max_no_places,
	   t.no_available_places as places_left
from trip t;


create or replace view vw_available_trip_6a as
select *
from vw_trip_6a
where trip_date >= current_date
	and places_left > 0;


create or replace procedure p_add_reservation_6a(vtrip_id number, vperson_id number)
as
	validtrip number;
	validperson number;
	noplaces number;
	new_reservation_id reservation.reservation_id%type;
begin
	select count(*)
	into validtrip
	from trip
	where trip_id = vtrip_id;

	if validtrip = 0 then
		raise_application_error(-20001, 'trip not found');
	end if;

	select no_available_places
	into noplaces
	from trip
	where trip_id = vtrip_id;

	if noplaces <= 0 then
		raise_application_error(-20001, 'trip not avaliable');
	end if;

	select count(*)
	into validperson
	from person
	where person_id = vperson_id;

	if validperson = 0 then
		raise_application_error(-20001, 'person not found');
	end if;

	insert into reservation(trip_id, person_id, status)
	values (vtrip_id, vperson_id, 'N')
	returning reservation_id into new_reservation_id;

	update trip
	set no_available_places = no_available_places - 1
	where trip_id = vtrip_id;

	insert into log(reservation_id, log_date, status)
	values (new_reservation_id, sysdate, 'N');
end;
/


create or replace procedure p_modify_reservation_status_6a(vreservation_id number, vstatus char)
as
	current_status char(1);
	vtrip_id number;
	noplaces number;
	valid_reservation number;
begin
	if vstatus not in ('N', 'P', 'C') then
		raise_application_error(-20001, 'invalid status');
	end if;

	select count(*)
	into valid_reservation
	from reservation
	where reservation_id = vreservation_id;

	if valid_reservation = 0 then
		raise_application_error(-20001, 'reservation not found');
	end if;

	select r.status, r.trip_id
	into current_status, vtrip_id
	from reservation r
	where r.reservation_id = vreservation_id;

	if current_status = vstatus then
		return;
	end if;

	if current_status = 'C' and vstatus in ('N', 'P') then
		select no_available_places
		into noplaces
		from trip
		where trip_id = vtrip_id;

		if noplaces <= 0 then
			raise_application_error(-20001, 'trip not avaliable');
		end if;

		update trip
		set no_available_places = no_available_places - 1
		where trip_id = vtrip_id;
	elsif current_status in ('N', 'P') and vstatus = 'C' then
		update trip
		set no_available_places = no_available_places + 1
		where trip_id = vtrip_id;
	end if;

	update reservation
	set status = vstatus
	where reservation_id = vreservation_id;

	insert into log(reservation_id, log_date, status)
	values (vreservation_id, sysdate, vstatus);
end;
/


create or replace procedure p_modify_max_no_places_6a(vtrip_id number, vmax_no_places number)
as
	current_max number;
	current_available number;
	reserved_count number;
begin
	if vmax_no_places < 0 then
		raise_application_error(-20001, 'max_no_places must be >= 0');
	end if;

	select max_no_places, no_available_places
	into current_max, current_available
	from trip
	where trip_id = vtrip_id;

	reserved_count := current_max - current_available;

	if vmax_no_places < reserved_count then
		raise_application_error(-20001, 'cannot lower max places below reserved count');
	end if;

	update trip
	set max_no_places = vmax_no_places,
		no_available_places = vmax_no_places - reserved_count
	where trip_id = vtrip_id;
end;
/
```

---

# Zadanie 6b - triggery

Obsługę pola `no_available_places` należy zrealizować przy pomocy triggerów

- podczas dodawania rezerwacji trigger powinien aktualizować pole `no_available_places` w tabeli trip
- podobnie, podczas zmiany statusu rezerwacji
- należy przygotować trigger/triggery oraz jeśli jest to potrzebne, zaktualizować procedury modyfikujące dane oraz widoki

> UWAGA
> Należy stworzyć nowe wersje tych widoków/procedur/triggerów (np. dodając do nazwy dopisek 6b - od numeru zadania). Poprzednie wersje procedur należy pozostawić w celu umożliwienia weryfikacji ich poprawności.

- może być potrzebne wyłączenie 'poprzednich wersji' triggerów

# Zadanie 6b - rozwiązanie

```sql
create trigger tr_check_avaliable_6b
	before insert
	on reservation
	for each row
declare
		noplaces int;
	begin
		select NO_AVAILABLE_PLACES
		into noplaces from trip
		where :NEW.trip_id = trip_id;

		if noplaces = 0 then
			raise_application_error(-20001, 'trip not avaliable');
		end if;

		update trip set no_available_places = no_available_places - 1 where :NEW.trip_id = trip_id;
	end;
/



create trigger tr_modify_reservation_status_6b
	before update
	on reservation
	for each row
declare
	noplaces int;
begin
	select no_available_places
	into noplaces
	from trip
	where :NEW.trip_id = trip_id;

	if :NEW.status = 'C' and :OLD.status <> 'C' then
		update trip set no_available_places = no_available_places + 1 where :NEW.trip_id = trip_id;
	elsif :NEW.status = 'N' and :OLD.status <> 'N' then
		if noplaces = 0 then
			raise_application_error(-20001, 'trip not avaliable');
		else
			update trip set no_available_places = no_available_places - 1 where :NEW.trip_id = trip_id;
		end if;

	end if;
end;
/

create or replace procedure p_add_reservation_6b(vtrip_id number, vperson_id number)
as
	validtrip number;
	validperson number;
	new_reservation_id reservation.reservation_id%type;
begin
	select count(*) into validtrip from trip where trip_id = vtrip_id;
	if validtrip = 0 then
		raise_application_error(-20001, 'trip not found');
	end if;

	select count(*) into validperson from person where person_id = vperson_id;
	if validperson = 0 then
		raise_application_error(-20001, 'person not found');
	end if;

	insert into reservation(trip_id, person_id, status)
	values (vtrip_id, vperson_id, 'N')
	returning reservation_id into new_reservation_id;

	insert into log(reservation_id, log_date, status)
	values (new_reservation_id, sysdate, 'N');
end;
/


create or replace procedure p_modify_reservation_status_6b(vreservation_id number, vstatus char)
as
	valid_reservation number;
begin
	if vstatus not in ('N', 'P', 'C') then
		raise_application_error(-20001, 'invalid status');
	end if;

	select count(*) into valid_reservation from reservation where reservation_id = vreservation_id;
	if valid_reservation = 0 then
		raise_application_error(-20001, 'reservation not found');
	end if;

	update reservation
	set status = vstatus
	where reservation_id = vreservation_id;
end;
/


create or replace procedure p_modify_max_no_places_6b(vtrip_id number, vmax_no_places number)
as
	valid_trip number;
begin
	if vmax_no_places < 0 then
		raise_application_error(-20001, 'max_no_places must be >= 0');
	end if;

	select count(*) into valid_trip from trip where trip_id = vtrip_id;
	if valid_trip = 0 then
		raise_application_error(-20001, 'trip not found');
	end if;

	update trip set max_no_places = vmax_no_places where trip_id = vtrip_id;
end;
/

```
